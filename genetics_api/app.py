import falcon

from .resources import BioticFactorResource, TaxonResource


app = application = falcon.API()

app.add_route('/taxon', TaxonResource())
app.add_route('/biotic_factor', BioticFactorResource())
