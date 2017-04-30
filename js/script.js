var factorsApp;


function search(val, spiece) {
    if (val == ''){
        document.getElementById('ul'+spiece).innerHTML = '';
    }
    else {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://genetics-api.swarmer.me/taxon?search=' + val, true);

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
                inn += '<li id="' + jsn[i]['id'] + '" class="collection-item searchItem" onclick="selectItem(this,' + spiece + ')">' + jsn[i]['english_name']
                    + '</li>';
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
            // document.getElementById(spiece).value = '';
            // document.getElementById('ul'+spiece).innerHTML = '';
            // document.getElementById('ul'+spiece).setAttribute('class', '');

}

function selectItem(item, spiece) {
    document.getElementById(spiece.id).value = item.innerHTML;
    //document.getElementById(spiece.id).value = '';
    document.getElementById('ul'+spiece.id).innerHTML = '';
    document.getElementById('ul'+spiece.id).setAttribute('class', '');
    document.getElementById(spiece.id).setAttribute('val', item.id);
}

var globalId1;
var globalId2;

function processing(){
    var id1 = document.getElementById("firstSpiece").getAttribute("val");
    var id2 = document.getElementById("secondSpiece").getAttribute("val");

    globalId1 = id1;
    globalId2 = id2;

    clearPopulationLayers();

    addPopulationLayer(map, gradient1, id1);
    addPopulationLayer(map, gradient2, id2);

    getFactors(id1, id2);
}

function getFactors(id1, id2){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://genetics-api.swarmer.me/biotic_factor?taxon1_id=' + id1 + '&taxon2_id=' + id2, true);

    var text;
    var jsn;
    xhr.onload = function() {
        text = this.responseText;
        jsn = JSON.parse(text);
        console.log(jsn);

        factorsApp = new Vue({
            el: '#factors',
            data: {
                factors: jsn,
                selectedFactors: [],

                showFactors: function () {
                    console.log(factorsApp.selectedFactors);

                    clearFactors();

                    factorsApp.selectedFactors.forEach(function(factor) {
                        addFactor(factor);
                    }, this);

                    console.log(factorsApp.selectedFactors);
                },

                newFactor: function () {
                    drawingManager.setMap(map);
                }
            }
        });

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
    xhr.open('GET', 'http://genetics-api.swarmer.me/taxon/' + id1, true);

    var text;
    var jsn;

    xhr.onload = function() {
        text = this.responseText;
        jsn = JSON.parse(text);

        var animalApp = new Vue({
            el: val,
            data: {
                taxon: jsn,
            }
        });
    }

    xhr.onerror = function() {
        alert( 'Ошибка ' + this.status );
    }
    xhr.send();
}
