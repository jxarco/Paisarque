var default_project = "pit";
var current_project = getQueryVariable("r") || default_project;
var latitud = 0;
var longitud = 0;
var lugar = "";
var youtubeLinkCounter = 0;
var pdfLinkCounter = 0;
var imagenLinkCounter = 0;
var textLinkCounter = 0;


$.ajax({dataType: "json",
        url: "data/"+current_project+'_anotacion.json',
        error:function(error){console.log(error)},
        success: function(data){
            if(window.parseJSONANOT) {
                parseJSONANOT(data);
            }
        }
});

$.ajax({dataType: "json",
        url: "data/"+current_project+'.json',
        error:function(error){console.log(error)},
        success:function(data){
            $('#project').html(data.id + "<span class='caret'></span>");
            if(window.parseJSON) {
                parseJSON(data);
                console.log(data);  
                latitud = data["coordenadas"]["lat"];
                longitud = data["coordenadas"]["lng"];
                lugar = data["lugar"];
            }
        }
});


function getQueryVariable(variable)
{ 
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}


function loadContent(url, project){
    
    document.location.href = url+"?r="+(project || current_project).toString();
}

$('#videoLink').click(function () {
    var src = 'https://www.youtube.com/embed/VI04yNch1hU;autoplay=1';
    // $('#introVideo').modal('show'); <-- remove this line
    $('#introVideo iframe').attr('src', src);
});

$('#introVideo button.close').on('hidden.bs.modal', function () {
    $('#introVideo iframe').removeAttr('src');
})

function initMap() {
    
    // https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
                
    var marker = {lat: latitud, lng: longitud};
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
        // Hacer que la latitud y la longitud se cojan del json!! 
        center: new google.maps.LatLng(latitud, longitud), zoom: 5
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
        
    var marker = new google.maps.Marker({
        position: marker,
        map: map,
        title: lugar
    });    
}


$('#cargarProyecto').click( function() {
    console.log("cargando proyecto");
    $('#GSCCModal').model('hide');
})

$("#formUploadProject").on('submit', function(e) {
    
    e.preventDefault();
    
    $('#GSCCModal').modal('hide');   
    
    //Cogemos los valores y quitamos el comportamiento por defecto del botón submit
    
    var values = getFormValues(this);
    
    // Enviar tambien la informacion de en que usuario estamos
    // para subir los ficheros a la carpeta que le corresponde
    
    var formData = new FormData(this);
    
    var user = "guest"
    var query = window.location.search.substring(1);
    var vars = query.split("?");
    
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == "user") {
            user = pair[1];
        }
    }
    formData.append("user", user);
    
    /*
    No estoy segura cual de los dos sera el correcto
    var urlMesh = "data/" + user + "/" + values["idProyecto"] + "/"; 
    var urlTexture = "data/" + user + "/" + values["idProyecto"] + "/"; 
    */
    
    var urlMesh = values["idProyecto"] + "/"; 
    var urlTexture = values["idProyecto"] + "/"; 
    
    var listaExtra = []; // hacer una lista de objetos de tipo {"type":"pdf",      "data":"data/wpbr.pdf"}, hay que mirar todos los que se suben, ver su nombre, url y que tipo son
    
    $(':file').each(function() {
        
        var input = $(this);   
        var nameInput = input[0]["name"];
        
        if (nameInput == "mesh") {
            if (input[0]["value"] == ""){
                alert("No subiste una mesh");
                return true;
            } else {
                var auxList = input[0]["value"].split('\\');
                var nameMesh = auxList[auxList.length - 1];
                urlMesh = urlMesh + nameMesh;
            }
        } else if (nameInput == "texture"){
            if (input[0]["value"] == ""){
                alert("No subiste una textura");
                return true;
            } else {
                var auxList = input[0]["value"].split('\\');
                var nameTexture = auxList[auxList.length - 1];
                urlTexture = urlTexture + nameTexture;
            }
        } else if (nameInput.includes("pdf")){
            var urlPdf = "data/" + user + "/" + values["idProyecto"] + "/"; 
            var auxList = input[0]["value"].split('\\');
            var namePdf = auxList[auxList.length - 1];
            urlPdf = urlPdf + namePdf;
            
            var objectPdf = {"type": "pdf", "data": urlPdf};
            
            listaExtra.push(objectPdf);
        } else if (nameInput.includes("image")) {
            var urlImagen = "data/" + user + "/" + values["idProyecto"] + "/"; 
            var auxList = input[0]["value"].split('\\');
            var nameImagen = auxList[auxList.length - 1];
            urlImagen = urlImagen + nameImagen;
            
            var objectImage = {"type": "image", "data": urlImagen};
            
            listaExtra.push(objectImage);
        }
        
    });
    
    if (values["idProyecto"] == "" || values["autor"] == "" || values["lugar"] == "" || values["latitud"] == "" || values["longitud"] == "") {
        alert("Rellena todos los campos");
        return true;
    }
    
    for (var key in values) {
        if (key.includes("text")) {
            var objectText = {"type": "text", "data": values[key]};
            if (values[key] == ""){
                alert("Rellena todos los campos");
                return;
            }
            listaExtra.push(objectText);
        } else if (key.includes("youtube")) {
            var objectYoutube = {"type":"youtube", "data": values[key]};
            if (values[key] == ""){
                alert("Rellena todos los campos");
                return;
            }
            listaExtra.push(objectYoutube);
        }
    }
    
    // falta anadir al form lo de las rotaciones
    var jsonFicheroPrincipal = {
        "id": values["idProyecto"],
        "autor": values["autor"],
        "lugar": values["lugar"],
        "coordenadas": {"lat": values["latitud"], "lng": values["longitud"]},
        "render":{"id":values["idProyecto"],"mesh":urlMesh,"texture":[urlTexture],
                  "rotaciones":[]},
        "extra":listaExtra
    };
        
    var fileNameString = "data/" + user + "/" + values["idProyecto"] + '.json';
    
    $.ajax({type: "GET",
            dataType : 'json',
            url: 'save_anotation.php',
            data: { data: JSON.stringify(jsonFicheroPrincipal), file_name:fileNameString}
    });
        
    
    fileNameString = "data/" + user + "/" + values["idProyecto"] + '_anotacion.json';

    $.ajax({type: "GET",
            dataType : 'json',
            url: 'save_anotation.php',
            data: { data: "", file_name:fileNameString}                  
    });
    
    // esto hare una llamada a ajax para que se cree un fichero con el nombre idProyecto.json y ademas otros igual con _anotacion.json
    
    $('#loadingModal').modal('show');   
    
    $.ajax( {
        url: 'uploadFile.php',
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false, 
        success: function(data) {
            
            $('#loadingModal').modal('hide');               
            // volver a cargar el contenido
            location = location;
        }
    } );
    
}) 

$('#buttonYoutubeLink').click( function() {
    
    var stringYoutubeLink = '<div class="form-group"><label for="youtube' + (youtubeLinkCounter+1) + '" class="col-lg-2 control-label">Youtube Link</label><div class="col-lg-10"><input type="url" class="form-control" id="youtube' + (youtubeLinkCounter+1) + '" name="youtube' + (youtubeLinkCounter+1) + '"></div></div>';
        
    $('#fieldset').append(stringYoutubeLink);
    youtubeLinkCounter++;
})

$('#buttonPDFLink').click( function() {
    
    var stringPDFLink = '<div class="form-group"><label for="pdfLink' + (pdfLinkCounter+1) + '" class="col-lg-2 control-label">PDF Link</label><div class="col-lg-10"><input type="file" class="form-control" id="pdfLink' + (pdfLinkCounter+1) + '" name="pdfLink' + (pdfLinkCounter+1) + '"></div></div>';
        
    $('#fieldset').append(stringPDFLink);
    pdfLinkCounter++;
})

$('#buttonImageLink').click( function() {
    
    var stringImageLink = '<div class="form-group"><label for="image' + (imagenLinkCounter+1) + '" class="col-lg-2 control-label">Image Link</label><div class="col-lg-10"><input type="file" class="form-control" id="image' + (imagenLinkCounter+1) + '" name="image' + (imagenLinkCounter+1)+ '" ></div></div>';
        
    $('#fieldset').append(stringImageLink);
    imagenLinkCounter++;
})

$('#buttonTextLink').click( function() {
    
    var stringTextLink = '<div class="form-group"><label for="text' + (textLinkCounter+1) + '" class="col-lg-2 control-label">Textos</label><div class="col-lg-10"><input type="text" class="form-control" id="text' + (textLinkCounter+1) + '" name="text' + (textLinkCounter+1) + '"></div></div>';
        
    $('#fieldset').append(stringTextLink);
    textLinkCounter++;
})

function changeCamera(camera, position_camera, target_camera, up_camera) {
    
    camera.position = position_camera;
    camera.target = target_camera;
    camera.up = up_camera;
    
}