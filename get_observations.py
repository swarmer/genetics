#!/usr/bin/env python3
import itertools
import json
import sys

import requests


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
            locations.append({
                'latitude': observation['latitude'],
                'longitude': observation['longitude'],
            })

        print('Got %d observations' % len(locations), file=sys.stderr)

    return locations


def main():
    taxon_id = int(sys.argv[1])
    locations = get_observation_locations(taxon_id)
    print(json.dumps(locations, indent=4, sort_keys=True))


if __name__ == '__main__':
    main()
