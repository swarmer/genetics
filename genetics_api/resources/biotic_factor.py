import json

import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class BioticFactorResource(object):
    def on_get(self, req, resp):
        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute('''
                SELECT id, name, marker_name, taxon1_id, taxon2_id
                FROM biotic_factors;
            ''')
            result = [self._serialize_row(row) for row in cursor.fetchall()]

            set_json_response(resp, result)

    def on_post(self, req, resp):
        payload = json.load(req.stream)

        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            cursor.execute(
                '''
                    INSERT INTO biotic_factors (name, marker_name, taxon1_id, taxon2_id) VALUES
                    (%(name)s, %(marker_name)s, %(taxon1_id)s, %(taxon2_id)s)
                ''',
                payload,
            )
            set_json_response(resp, {})


    def _serialize_row(self, row):
        return dict(row)
