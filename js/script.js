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
            console.log(jsn);

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

function processing(){
    var id1 = document.getElementById("firstSpiece").getAttribute("val");
    var id2 = document.getElementById("secondSpiece").getAttribute("val");
    clearPopulationLayers();
    addPopulationLayer(map, gradient1, id1);
    addPopulationLayer(map, gradient2, id2);
}