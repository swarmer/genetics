var factorsApp = null;
var animalApp1 = null;
var animalApp2 = null;

var colors = ["pink", "purple", "blue", "indigo", "green"];
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

function checkAnimals(){
    if (animals.taxons.length > 1){
        $('#speciesInput').show();
        $('#speciesError').hide();
    }
    if (animals.taxons.length >= 3){
        $('#treeSign').hide();
        $('#treeSpinner').show();
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

function selectItem(item, spiece) {
    document.getElementById(spiece.id).value = '';
    var eName = document.getElementById(item.id).getAttribute("value");
    var lName = document.getElementById(item.id).getAttribute("data-lName");
    animals.taxons.push({id: item.id ,english_name: eName, latin_name: lName, color: colors[ind]});
    checkAnimals();
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
