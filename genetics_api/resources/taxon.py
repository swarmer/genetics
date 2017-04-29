import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class TaxonResource(object):
    def on_get(self, req, resp):
        connection = connect()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)

        cursor.execute('''
            SELECT id, english_name, latin_name, thumbnail_url
            FROM taxons;
        ''')
        result = {row['id']: self._serialize_row(row) for row in cursor.fetchall()}
        for taxon_data in result.values():
            taxon_data['observations'] = []

        observations = self.get_observations(cursor, set(result.keys()))
        for observation in observations:
            taxon_data = result[observation['taxon_id']]
            taxon_data['observations'].append({
                'latitude': observation['latitude'],
                'longitude': observation['longitude'],
            })

        set_json_response(resp, result)

    def get_observations(self, cursor, taxon_ids):
        cursor.execute(
            '''
                SELECT taxon_id, latitude, longitude
                FROM observations
                WHERE taxon_id in %(taxon_ids)s;
            ''',
            {'taxon_ids': tuple(taxon_ids)},
        )
        return cursor.fetchall()

    def _serialize_row(self, row):
        return dict(row)
