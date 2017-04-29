import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class TaxonResource(object):
    def on_get(self, req, resp):
        search = req.get_param('search')
        add_observations = req.get_param('observations', default='false').lower() == 'true'

        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            if search:
                pattern = '%{}%'.format(search)
                condition = '(english_name ILIKE %(pattern)s OR latin_name ILIKE %(pattern)s)'
            else:
                pattern = None
                condition = '(TRUE)'

            cursor.execute(
                '''
                    SELECT id, english_name, latin_name, thumbnail_url
                    FROM taxons
                    WHERE {condition};
                '''.format(condition=condition),
                {'pattern': pattern},
            )
            result = {row['id']: self._serialize_row(row) for row in cursor.fetchall()}

            if add_observations:
                for taxon_data in result.values():
                    taxon_data['observations'] = []

                observations = self.get_observations(cursor, set(result.keys()))
                for observation in observations:
                    taxon_data = result[observation['taxon_id']]
                    taxon_data['observations'].append({
                        'latitude': observation['latitude'],
                        'longitude': observation['longitude'],
                    })

            set_json_response(resp, list(result.values()))

    def get_observations(self, cursor, taxon_ids):
        if not taxon_ids:
            return []

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
