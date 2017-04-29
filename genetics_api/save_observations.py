#!/usr/bin/env python3
import itertools
import json
import sys

import psycopg2.extras
import requests

from genetics_api.db import connect


def get_observation_locations(taxon_id):
    locations = []

    for page in itertools.count(1):
        page_result = requests.get(
            'http://www.inaturalist.org/observations.json',
            params={'taxon_id': taxon_id, 'per_page': 200, 'page': page},
        )
        if page_result.status_code != 200:
            print(page_result, file=sys.stderr)
            break

        observations = page_result.json()
        if not observations:
            break

        for observation in observations:
            if not observation['latitude'] or not observation['longitude']:
                continue

            locations.append({
                'latitude': observation['latitude'],
                'longitude': observation['longitude'],
            })

        print('Got %d observations' % len(locations), file=sys.stderr)

    return locations


def main():
    taxon_id = int(sys.argv[1])
    own_taxon_id = int(sys.argv[2])
    locations = get_observation_locations(taxon_id)

    for location in locations:
        location['taxon_id'] = own_taxon_id

    with connect() as connection, connection.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        cursor.executemany(
            '''
                INSERT INTO observations (taxon_id, latitude, longitude) VALUES
                (%(taxon_id)s, %(latitude)s, %(longitude)s);
            ''',
            locations,
        )


if __name__ == '__main__':
    main()
