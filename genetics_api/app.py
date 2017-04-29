import falcon

from .resources import TaxonResource


app = application = falcon.API()

app.add_route('/taxon', TaxonResource())
