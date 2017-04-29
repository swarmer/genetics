function search(val, spiece) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://genetics-api.swarmer.me/taxon?search=' + val, true);

    var text;
    var jsn;
    xhr.onload = function() {
       text = this.responseText;
       jsn = JSON.parse(text);
       console.log(jsn[0]['english_name']);
       console.log(jsn.length);

       for (var i=0; i<jsn.length; i++){
           document.getElementById(spiece);
       }
    }

    //console.log(text);
    //console.log(JSON.parse(text));

    xhr.onerror = function() {
        alert( 'Ошибка ' + this.status );
    }
    xhr.send();


    // var x = new XMLHttpRequest();
    // x.open("GET", "http://genetics-api.swarmer.me/taxon?search=" + val, true);
    // x.onload = function (){
    //     alert( x.responseText);
    // }
    // x.send(null);
}