
// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

var map, populations = [], factors = {};

var gradient1 = [
    'rgba(0, 255, 0, 0)',
    'rgba(0, 255, 0, 0.5)',
    'rgba(0, 255, 0, 1)',
    'rgba(0, 255, 0, 1)'
];

var gradient2 = [
    'rgba(0, 0, 255, 0)',
    'rgba(0, 0, 255, 0.5)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 255, 1)'
];

function addPopulationLayer(map, gradient, taxonId) {
    $.get("http://genetics-api.swarmer.me/taxon/" + taxonId.toString() + "?observations=true", function(result) {
        var data = [];
        result[0].observations.forEach(function(observation) {
            data.push(new google.maps.LatLng(observation.latitude, observation.longitude));
        }, this);

        var heatmap = new google.maps.visualization.HeatmapLayer({
            map: map,
            data: data
        });
        heatmap.set('gradient', gradient);
        heatmap.set('radius', 40);

        populations.push(heatmap);
    });
}

function addFactor(factor) {
    var factorLine = new google.maps.Polyline({
        path: factor.polyline,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    factorLine.setMap(map);

    factors[factor.id] = factorLine;
}

function clearFactor(factorId) {
    factors[factorId].setMap(null);
    delete factors[factorId];
}

function clearPopulationLayers() {
    populations.forEach(function(p) {
        p.setMap(null);
    }, this);

    populations = [];
    factors = {};
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 37.775, lng: -122.434},
        mapTypeId: 'satellite'
    });

    addPopulationLayer(map, gradient1, 1);
    addPopulationLayer(map, gradient2, 2);
    addFactor({
        "id": 100500,
        "polyline": [
            {"lng": -122.214, "lat": 37.772}, {"lng": -157.821, "lat": 21.291},
            {"lng": 178.431, "lat": -18.142}, {"lng": 153.027, "lat": -27.467}
        ]
    });
}
