
// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

var map, populations = [], factors = {}, drawingManager;

// var gradient1 = [
//     'rgba(243, 21, 195, 0)',
//     'rgba(243, 21, 195, 0.5)',
//     'rgba(243, 21, 195, 1)',
//     'rgba(243, 21, 195, 1)'
// ];
//
// var gradient2 = [
//     'rgba(0, 0, 255, 0)',
//     'rgba(0, 0, 255, 0.5)',
//     'rgba(0, 0, 255, 1)',
//     'rgba(0, 0, 255, 1)'
// ];
//
// var gradient3 = [
//     'rgba(181, 21, 243, 0)',
//     'rgba(181, 21, 243, 0.5)',
//     'rgba(181, 21, 243, 1)',
//     'rgba(181, 21, 243, 1)'
// ];
//
// var gradient4 = [
//     'rgba(33, 21, 243, 0)',
//     'rgba(33, 21, 243, 0.5)',
//     'rgba(33, 21, 243, 1)',
//     'rgba(33, 21, 243, 1)'
// ];
//
// var gradient5 = [
//     'rgba(0, 255, 0, 0)',
//     'rgba(0, 255, 0, 0.5)',
//     'rgba(0, 255, 0, 1)',
//     'rgba(0, 255, 0, 1)'
// ];

var gradient1 = [
    'rgba(243, 21, 21, 0)',
    'rgba(243, 21, 21, 0.5)',
    'rgba(243, 21, 21, 1)',
    'rgba(243, 21, 21, 1)'
];

var gradient2 = [
    'rgba(243, 221, 21, 0)',
    'rgba(243, 221, 21, 0.5)',
    'rgba(243, 221, 21, 1)',
    'rgba(243, 221, 21, 1)'
];

var gradient3 = [
    'rgba(49, 243, 21, 0)',
    'rgba(49, 243, 21, 0.5)',
    'rgba(49, 243, 21, 1)',
    'rgba(49, 243, 21, 1)'
];

var gradient4 = [
    'rgba(21, 240, 243, 0)',
    'rgba(21, 240, 243, 0.5)',
    'rgba(21, 240, 243, 1)',
    'rgba(21, 240, 243, 1)'
];

var gradient5 = [
    'rgba(60, 21, 243, 0)',
    'rgba(60, 21, 243, 0.5)',
    'rgba(60, 21, 243, 1)',
    'rgba(60, 21, 243, 1)'
];

var gradients = [gradient1, gradient2, gradient3, gradient4, gradient5];

function addPopulationLayer(map, gradient, taxonId) {
    $.get("http://genetics-api2.swarmer.me/taxon/" + taxonId.toString() + "?observations=true", function(result) {
        var data = [];
        result.observations.forEach(function(observation) {
            data.push(new google.maps.LatLng(observation.latitude, observation.longitude));
        }, this);

        var heatmap = new google.maps.visualization.HeatmapLayer({
            map: map,
            data: data,
            dissipating: false,
            opacity: 0.5,
        });
        heatmap.set('gradient', gradient);
        heatmap.set('radius', 5);

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

function clearFactors() {
    Object.values(factors).forEach((f) => {
        f.setMap(null);
    });

    factors = {};
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
        mapTypeId: 'satellite',
        maxZoom: 5,
    });

    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYLINE,
        drawingControl: false,
        polylineOptions: {
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        },
    });
    //drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'polylinecomplete', function(event) {
        var polyline = JSON.stringify(event.getPath().getArray());

        // Get remaining fields...

        var data = {
            name: null,
            marker_name: null,
            taxon1_id: null,
            taxon2_id: null,
            description: null,
            polyline: polyline,
            type: null,
        };
        console.log(data);
        $.ajax({
            type: 'POST',
            url: 'http://genetics-api2.swarmer.me/biotic_factor',
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: 'json'
        });
    });
}
