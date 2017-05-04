import contextlib
import json
import os
import random
import requests
import string
import subprocess
import tempfile
import time

import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect

from Bio import Phylo
import pylab


def encode_for_clustal(name):
    return name.replace(' ', '_')


def unfuck_clustal_name(name):
    return name.replace('_', ' ')


@contextlib.contextmanager
def tempname(ext=''):
    name = '/tmp/' + ''.join(random.choice(string.ascii_letters) for _ in range(20)) + ext

    yield name

    try:
        os.remove(name)
    except FileNotFoundError:
        pass


def get_tree_desc(phylogeny_input):
    with open(phylogeny_input) as infile:
        data = infile.read()

        response = requests.post(
            'http://www.ebi.ac.uk/Tools/services/rest/simple_phylogeny/run/',
            headers={
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
            params={
                'email': 'anton@swarmer.me',
                'sequence': data,
            }
        )
        assert response.status_code == 200
        job_id = response.text

        while True:
            response = requests.get(
                'http://www.ebi.ac.uk/Tools/services/rest/simple_phylogeny/status/%s' % job_id,
            )
            print('Status: %s' % response.text)
            if response.text == 'FINISHED':
                break

            time.sleep(1)

        response = requests.get(
            'http://www.ebi.ac.uk/Tools/services/rest/simple_phylogeny/result/%s/tree' % job_id,
        )
        assert response.status_code == 200
        tree_desc = response.text

        return tree_desc


def get_tree_bytes(pairs):
    with tempfile.NamedTemporaryFile(mode='w') as clustal_input, \
            tempname() as phylogeny_input, \
            tempname() as tree_desc_path, \
            tempname(ext='.png') as img_path:
        for name, sequence in pairs:
            clustal_input.write('> %s\n%s\n\n' % (encode_for_clustal(name), sequence))
        clustal_input.flush()

        subprocess.check_call([
            '/clustalo', '-i', clustal_input.name, '--outfmt=clu', '-o', phylogeny_input
        ])

        tree_desc = get_tree_desc(phylogeny_input)
        with open(tree_desc_path, 'w') as tree_desc_file:
            tree_desc_file.write(tree_desc)

        draw_tree(tree_desc_path, img_path)

        with open(img_path, 'rb') as img_file:
            img_bytes = img_file.read()
            return img_bytes


def draw_tree(input_path, output_path):
    tree = Phylo.read(input_path, 'newick')
    pylab.savefig(output_path)


class PhylotreeResource(object):
    def on_get(self, req, resp):
        taxon_ids = req.get_param_as_list('taxon_ids', transform=int, required=True)

        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute(
                '''
                    SELECT latin_name, sequence
                    FROM taxons
                    WHERE id in %(taxon_ids)s;
                ''',
                {'taxon_ids': tuple(taxon_ids)},
            )
            rows = cursor.fetchall()
            if not rows:
                raise falcon.HTTPNotFound()

            png_bytes = get_tree_bytes(
                (row['latin_name'], row['sequence'])
                for row in rows
            )

            resp.body = png_bytes
            resp.content_type = 'image/png'
            resp.status = falcon.HTTP_200
