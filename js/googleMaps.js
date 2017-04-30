
// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

var map, populations = [];

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

function clearPopulationLayers() {
    populations.forEach(function(p) {
        p.setMap(null);
    }, this);

    populations = [];
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 37.775, lng: -122.434},
        mapTypeId: 'satellite'
    });

    //addPopulationLayer(map, gradient1, 1);
    //addPopulationLayer(map, gradient2, 2);
}
