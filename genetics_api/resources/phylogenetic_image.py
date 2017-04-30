import json

import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class PhylogeneticImageResource(object):
    def on_get(self, req, resp):
        taxon1_id = req.get_param_as_int('taxon1_id')
        taxon2_id = req.get_param_as_int('taxon2_id')

        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            if taxon1_id and taxon2_id:
                condition = '''
                    (taxon1_id = %(taxon1_id)s AND taxon2_id = %(taxon2_id)s) OR
                    (taxon2_id = %(taxon1_id)s AND taxon1_id = %(taxon2_id)s)
                '''
                params = {
                    'taxon1_id': taxon1_id,
                    'taxon2_id': taxon2_id,
                }
            else:
                condition = '(TRUE)'
                params = {}

            cursor.execute(
                '''
                    SELECT image_url
                    FROM phylogenetic_images
                    WHERE {condition};
                '''.format(condition=condition),
                params,
            )
            rows = cursor.fetchall()
            if not rows:
                result = {'image_url': None}
            else:
                result = dict(rows[0])

            set_json_response(resp, result)
