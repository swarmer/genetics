function search(val, spiece) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://genetics-api.swarmer.me/taxon?search=' + val, true);

    var text;
    var jsn;
    xhr.onload = function() {
       text = this.responseText;
       jsn = JSON.parse(text);
       //console.log(jsn[0]['english_name']);
       //console.log(jsn.length);

        document.getElementById('sp').innerHTML = '';
       var inn = '<ul>';
       for (var i=0; i<jsn.length; i++){
           inn += '<li>' + jsn[i]['english_name'] + '</li>';
       }
       inn += '</ul>';
        document.getElementById('sp').innerHTML = inn;
    }

    xhr.onerror = function() {
        alert( 'Ошибка ' + this.status );
    }
    xhr.send();
}