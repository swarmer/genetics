import falcon

from .resources import BioticFactorResource, TaxonResource


class CorsMiddleware(object):
    def process_request(self, req, resp):
        pass

    def process_resource(self, req, resp, resource, params):
        pass

    def process_response(self, req, resp, resource, req_succeeded):
        resp.set_header('Access-Control-Allow-Origin', '*')


app = application = falcon.API(middleware=CorsMiddleware())

app.add_route('/taxon', TaxonResource())
app.add_route('/biotic_factor', BioticFactorResource())
