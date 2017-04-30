import falcon
import psycopg2.extras

from .utils import set_json_response
from genetics_api.db import connect


class TaxonResource(object):
    def on_get(self, req, resp, taxon_id=None):
        search = req.get_param('search')
        add_observations = req.get_param('observations', default='false').lower() == 'true'

        with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
            if search:
                pattern = '%{}%'.format(search)
                search_condition = '(english_name ILIKE %(pattern)s OR latin_name ILIKE %(pattern)s OR gene ILIKE %(pattern)s)'
            else:
                pattern = None
                search_condition = '(TRUE)'

            if taxon_id is not None:
                filter_condition = '(id = %(taxon_id)s)'
            else:
                filter_condition = '(TRUE)'

            cursor.execute(
                '''
                    SELECT id, english_name, latin_name, thumbnail_url, taxonomy, gene
                    FROM taxons
                    WHERE {search_condition} AND {filter_condition};
                '''.format(search_condition=search_condition, filter_condition=filter_condition),
                {'pattern': pattern, 'taxon_id': taxon_id},
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

            if taxon_id is not None:
                set_json_response(resp, list(result.values())[0])
            else:
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
