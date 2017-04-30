import json

import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class BioticFactorResource(object):
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
                    SELECT id, name, marker_name, taxon1_id, taxon2_id, polyline, description
                    FROM biotic_factors
                    WHERE {condition};
                '''.format(condition=condition),
                params,
            )
            result = [self._serialize_row(row) for row in cursor.fetchall()]

            set_json_response(resp, result)

    def on_post(self, req, resp):
        payload = json.load(req.stream)

        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute(
                '''
                    INSERT INTO biotic_factors (name, marker_name, taxon1_id, taxon2_id, description, polyline) VALUES
                    (%(name)s, %(marker_name)s, %(taxon1_id)s, %(taxon2_id)s, %(description)s, %(polyline)s)
                ''',
                payload,
            )
            set_json_response(resp, {})


    def _serialize_row(self, row):
        return dict(row)
