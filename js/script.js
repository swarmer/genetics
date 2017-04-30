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
            //console.log(jsn[0]['english_name']);
            //console.log(jsn.length);

            document.getElementById('ul'+spiece).setAttribute('class', 'collection');
            document.getElementById('ul'+spiece).innerHTML = '';
            //var inn = '<ul>';
            var inn = ''
            var size = jsn.length;
            if (size > 6)
                size = 6;
            for (var i=0; i<size; i++){
                //inn += '<li>' + jsn[i]['english_name'] + '</li>';
                inn += '<li class="collection-item searchItem" onclick="selectItem(this,' + spiece + ')">' + jsn[i]['english_name']
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
}