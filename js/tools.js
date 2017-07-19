var default_project = "pit";
var current_project = getQueryVariable("r") || default_project;
var latitud = 0;
var longitud = 0;
var lugar = "";
var youtubeLinkCounter = 0;
var pdfLinkCounter = 0;
var imagenLinkCounter = 0;
var textLinkCounter = 0;

var proj_to_delete = "test";
var delete_project_active = false;

// GET DATA FROM JSONS

// this function calls the other
// so we are getting all necessary data
loadANOTfromJSON();
    
// FINISH GETTING DATA FROM JSONS

function enable_project_delete()
{
    if(!delete_project_active)
    {
        delete_project_active = true;
        alert("Select the project which has to be deleted");
    }
}

function deleteProject(user, project)
{
    if(!project.length)
        return;
    
    var r = confirm("Are you sure you want to delete this project?");
    if(!r)
    {
        delete_project_active = false;  
        return;
    }
        
    
    var project_to_delete = [
        "data/" + user + "/" + project + ".json",
        "data/" + user + "/" + project + "_anotacion.json",
        "data/" + user + "/" + project,
    ]
    
    $.ajax({
      url: 'deleteFile.php',
      data: {'file' : project_to_delete[0],
            'a_file': project_to_delete[1],
            'folder': project_to_delete[2],
            },
      success: function (response) {
//        console.log(response);
//        alert("project has been deleted");
          document.location.href = 'inicio.php?user=' + user;
          delete_project_active = false;
      }
    });
};

function showCompletePath(current_user)
{
    
    $.ajax( {
        url: 'show_cp_path.php',
        type: 'POST',
        success: function() {
            document.location.href = 'inicio.php?user=' + current_user;
        }
    } );
}

function loadContent(url, project)
{
    if(!delete_project_active)
    {
        console.log("loading content " + url);
        document.location.href = url+"?r="+(project || current_project).toString();    
    }
    else
    {
        var array = project.split('/');
        deleteProject(array[0], array[1]);
    }
}

function loadMapsAPI()
{
    addScript( 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrcNsufDO4FEmzoCO9X63ru59CUvCe2YI&callback=initMap' );
}

function initMap() 
{
    
    // https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
                
    var marker = {lat: latitud, lng: longitud};
    
//    console.log("latitud y longitud utilizadas");  
    
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

function lookAtAnot(camera, position_camera, target_camera, up_camera, anot_id)
{
    
    camera.position = position_camera;
    camera.target = target_camera;
    camera.up = up_camera;
    
    for(var i = 0; i < scene.root.children.length; i++)
    {
        var current = scene.root.children[i];
        if(current.id === anot_id){
            //console.log(current);
            current.active = true;
            //console.log(current);
        }
        else{
            current.active = false;
        }   
    }
}

$('#fullscreen-mode').click(function(){
    
//    var canvas = $('#myCanvas');
//    
//    console.log(canvas);
//    
//   if (!document.mozFullScreen && !document.webkitFullScreen) {
//      if (canvas.mozRequestFullScreen) {
//        canvas.mozRequestFullScreen();
//      } else {
//        canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
//      }
//    } else {
//      if (document.mozCancelFullScreen) {
//        document.mozCancelFullScreen();
//      } else {
//        document.webkitCancelFullScreen();
//      }
//    }
});

$("#logout").click(function() {   
     $.ajax( {
        url: 'logout.php',
        type: 'POST',
        success: function() {
            document.location.href = 'index.html';
        }
    } );
    
});

$('#cargarProyecto').click( function() {
    console.log("cargando proyecto");
    $('#GSCCModal').model('hide');
});

$('#videoLink').click(function () {
    var src = 'https://www.youtube.com/embed/VI04yNch1hU;autoplay=1';
    // $('#introVideo').modal('show'); <-- remove this line
    $('#introVideo iframe').attr('src', src);
});

$('#introVideo button.close').on('hidden.bs.modal', function () {
    $('#introVideo iframe').removeAttr('src');
});

$("#formUploadProject").on('submit', function(e) {
    
    e.preventDefault();
    
    $('#GSCCModal').modal('hide');   
    
    //Cogemos los valores y quitamos el comportamiento por defecto del botón submit
    
    var values = getFormValues(this);
    
    // Por si el nombre del proyecto tiene espacios!
    values["idProyecto"] = values["idProyecto"].replace(/ /g, '_');

    // Enviar tambien la informacion de en que usuario estamos
    // para subir los ficheros a la carpeta que le corresponde
    
    var formData = new FormData(this);
    
    var user = "guest";
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
    
    if (!values["idProyecto"].length || !values["autor"].length || !values["lugar"].length || !values["latitud"].length || !values["longitud"].length) {
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
    
    /* falta anadir al form lo de las rotaciones
    *  en lugar de añadirlo, permitir que se rote al gusto y poder 
    *  guardarlo en el json
    */
    var jsonFicheroPrincipal = {
        "id": values["idProyecto"],
        "autor": values["autor"],
        "lugar": values["lugar"],
        "coordenadas": {"lat": values["latitud"], "lng": values["longitud"]},
        "render":{"id":values["idProyecto"],"mesh":urlMesh,"texture":[urlTexture],
                  "rotaciones":[]},
        "extra":listaExtra
    };
    
    // DEBUG
//    jsonFicheroPrincipal = {
//        "id": values["idProyecto"],
//        "autor": values["autor"],
//        "lugar": values["lugar"],
//        "coordenadas": {"lat": values["latitud"], "lng": values["longitud"]},
//        "extra":listaExtra,
//        "render":{"id":values["idProyecto"],"mesh":urlMesh,"texture":[urlTexture],
//                  "rotaciones":[]}
//    };
    //
        
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
    
    // Resetear campos del form
    $(this).trigger("reset");
    
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