import contextlib
import os
import random
import requests
import string
import subprocess
import tempfile
import time

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
