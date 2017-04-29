import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class BioticFactorResource(object):
    def on_get(self, req, resp):
        connection = connect()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute('''
            SELECT id, name, marker_name, taxon1_id, taxon2_id
            FROM biotic_factors;
        ''')
        result = [self._serialize_row(row) for row in cursor.fetchall()]

        set_json_response(resp, result)

    def _serialize_row(self, row):
        return dict(row)
