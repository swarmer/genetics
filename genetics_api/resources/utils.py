import json

import falcon


def set_json_response(resp, data):
    resp.body = json.dumps(data)
    resp.content_type = 'application/json'
    resp.status = falcon.HTTP_200
