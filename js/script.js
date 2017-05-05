var factorsApp = null;
var animalApp1 = null;
var animalApp2 = null;

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

var gradients = [gradient1, gradient2, gradient3, gradient4, gradient5];

var colors = ["red", "yellow", "green", "blue", "indigo"];
var ind = 0;

animals = new Vue({
    el: '#forSpieces',
    data: {
        taxons: [],
    }
});


$(document).ready(function() {
    $('select').material_select();
});

function search(val, spiece) {
    if (val == ''){
        document.getElementById('ul'+spiece).innerHTML = '';
    }
    else {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://genetics-api2.swarmer.me/taxon?search=' + val, true);

        var text;
        var jsn;
        xhr.onload = function() {
            text = this.responseText;
            jsn = JSON.parse(text);

            document.getElementById('ul'+spiece).setAttribute('class', 'collection');
            document.getElementById('ul'+spiece).innerHTML = '';
            var inn = ''
            var size = jsn.length;

            if (size > 6)
                size = 6;
            for (var i=0; i<size; i++){
                var lName = jsn[i]['latin_name'];
                inn += '<li id="' + jsn[i]['id'] + '" class="collection-item searchItem" value="'+ jsn[i]['english_name'] +'" onclick="selectItem(this,' + spiece + ')" data-lName="'+lName+'">' + jsn[i]['english_name']
                    + ' <span class="light"> '+ jsn[i]['latin_name'] + '</span> <span class="thin"> '+ jsn[i]['gene'] +'</span></li>';
            }
            document.getElementById('ul'+spiece).innerHTML = inn;
        }

        xhr.onerror = function() {
            alert( 'Ошибка ' + this.status );
        }
        xhr.send();
    }
}


function clearUl(spiece) {
    if (document.getElementById(spiece).value == ''){
        document.getElementById(spiece).setAttribute('val', '');
    }
}

function clearAll() {
    animals.taxons=[];
    ind = 0;
    checkAnimals();
    draw();
}

function checkAnimals(){
    if (animals.taxons.length == 0){
        $('#delete').hide();
    }
    if (animals.taxons.length >= 1){
        $('#delete').show();
        $('#speciesInput').show();
        $('#speciesError').hide();
    }
    if (animals.taxons.length >= 3){
        $('#treeSign').hide();
        $('#treeSpinner').show();

        var ids = 'http://genetics-api2.swarmer.me/phylotree?taxon_ids=';
        for (var i = 0; i < animals.taxons.length; ++i) {
            ids += animals.taxons[i].id + ',';
        }
        ids = ids.slice(0, ids.length-1);
        ids += '&vjk='+Math.random();

        $('#treeImgImg').attr('src', ids);

        $('img').load(function() {
            $('#treeImg').show();
            $('#treeSpinner').hide();
        });

        // http://genetics-api2.swarmer.me/phylotree?taxon_ids=17,24
    } else {
        $('#treeSign').show();
        $('#treeSpinner').hide();
        $('#treeImg').hide();
    }
    if (animals.taxons.length >= 5){
        $('#speciesError').show();
        $('#speciesInput').hide();
    }
}

function draw() {
    clearPopulationLayers();
    for (var i = 0; i < animals.taxons.length; ++i){
        addPopulationLayer(map, gradients[i], animals.taxons[i].id);
    }
}

function selectItem(item, spiece) {
    document.getElementById(spiece.id).value = '';
    var eName = document.getElementById(item.id).getAttribute("value");
    var lName = document.getElementById(item.id).getAttribute("data-lName");
    animals.taxons.push({id: item.id ,english_name: eName, latin_name: lName, color: colors[ind]});
    checkAnimals();

    draw();

    ind = ind + 1;
    if (ind >= 5){
        ind = 0;
    }
    document.getElementById('ulfirstSpiece').innerHTML = '';
}

function deleteAnimal(i){
    --ind;
    console.log(animals.taxons);
    $(i).parent().parent().remove();
    var deleteId = $(i).parent().parent().attr('id');
    var deleteInd;
    for (var i = 0; i < animals.taxons.length; ++i){
        if (animals.taxons.id == deleteId){
            deleteInd = i;
            break;
        }
    }
    animals.taxons.splice(deleteInd, 1);

    console.log(animals.taxons);
    checkAnimals();

    draw();
}

var globalId1;
var globalId2;

function processing(){
    var id1 = null;
    var id2 = null;
    id1 = document.getElementById("firstSpiece").getAttribute("val");
    id2 = document.getElementById("secondSpiece").getAttribute("val");

    globalId1 = id1;
    globalId2 = id2;

    clearPopulationLayers();

    if (id1 != null) {
        addPopulationLayer(map, gradient1, id1);
        getAnimalInfo(id1, true);
    }

    if (id2 != null) {
        addPopulationLayer(map, gradient2, id2);
        getAnimalInfo(id2, false);
    }

    getFactors(id1, id2);
}

function getFactors(id1, id2){
    if (!id1 || !id2)
        return;

    $.get("http://genetics-api2.swarmer.me/phylogenetic_image/?taxon1_id=" + id1 + "&taxon2_id=" + id2, function(result) {
        var url = result.image_url;
        var image = document.getElementById('tree-img');
        image.setAttribute('src', url);

        var section = document.getElementById('phyl-section');
        if (url != null)
            $(section).show();
        else
            $(section).hide();
    });

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://genetics-api2.swarmer.me/biotic_factor?taxon1_id=' + id1 + '&taxon2_id=' + id2, true);

    var text;
    var jsn;
    xhr.onload = function() {
        text = this.responseText;
        jsn = JSON.parse(text);

        if (factorsApp == null) {
            factorsApp = new Vue({
                el: '#factors',
                data: {
                    factors: jsn,
                    selectedFactors: [],

                    showFactors: function () {

                        clearFactors();
                        factorsApp.selectedFactors.forEach(function(factor) {
                            addFactor(factor);
                        }, this);

                    },

                    newFactor: function () {
                        drawingManager.setMap(map);
                    }
                }
            });
        }
        else {
            factorsApp.factors = jsn;
        }

        getAnimalInfo(id1, true);
        getAnimalInfo(id2, false);
    }

    xhr.onerror = function() {
        alert( 'Ошибка ' + this.status );
    }

    xhr.send();
}

function getAnimalInfo(id1, bol) {
    var val = '#tax1';
    if (bol == false){
        val = '#tax2';
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://genetics-api2.swarmer.me/taxon/' + id1, true);

    var text;
    var jsn;

    xhr.onload = function() {
        text = this.responseText;
        jsn = JSON.parse(text);


        if (bol) {
            if (animalApp1 == null) {
                animalApp1 = new Vue({
                    el: val,
                    data: {
                        taxon: jsn,
                    }
                });
            } else {
                animalApp1.taxon = jsn;
            }
        } else {
            if (animalApp2 == null) {
                animalApp2 = new Vue({
                    el: val,
                    data: {
                        taxon: jsn,
                    }
                });
            } else {
                animalApp2.taxon = jsn;
            }
        }
    }

    xhr.onerror = function() {
        alert( 'Ошибка ' + this.status );
    }
    xhr.send();
}
