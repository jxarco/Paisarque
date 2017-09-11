var youtubeLinkCounter = 0;
var pdfLinkCounter = 0;
var imagenLinkCounter = 0;
var textLinkCounter = 0;

/* EXTRA STUFF */

// Adding any type of extra to the list of _extra in the project
$(".add_extra").click(function(){
    
    var from = "#" + $(this).data("from");
    var type = $(this).data("type");
    var data = $(from).val();

    if(data == "")
        return 0;
        
    copy.pushExtra(type, data);
    $(from).val("");
    parseExtraJSON(copy._extra);
});

$(".refresh").click(function(){
    parseExtraJSON(copy._extra);
});

$("#formAddImage").on('submit', function(e)
{
    console.log("uploading image");
    e.preventDefault();
    $('#TESTModal').modal('hide');   
    
    //Cogemos los valores y quitamos el comportamiento por defecto del botón submit
    var values = getFormValues(this);
    
    /*       guest/grave       */
    var project_id = current_project;

    // Enviar tambien la informacion de en que usuario estamos
    // para subir los ficheros a la carpeta que le corresponde
    
    var formData = new FormData(this);
    var user = getQueryVariable("user") || "guest";
    formData.append("user", user);
    formData.append("id", project_id);
    
    var urlImage = "data/" + project_id + "/"; 
    
    $(':file').each(function() {
        var input = $(this);
        
        if (input[0]["value"] == ""){
                alert("Asegúrate de subir una imagen!");
                return 0;
            } else {
                var auxList = input[0]["value"].split('\\');
                var nameMesh = auxList[auxList.length - 1];
                urlImage += nameMesh;
            }
        
//        console.log(urlImage);
        // add image to project
        copy.pushExtra("image", urlImage);
        
    });
    
    $('#loadingModal').modal('show');   
    
    //  UNCOMMENT TO DEBUG
    //  return 0;
    //
    
    $.ajax( {
        url: 'uploadImage.php',
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false, 
        success: function(data) {
            $('#loadingModal').modal('hide');               
        }
    } );
    
    // Resetear campos del form
    $(this).trigger("reset");
    
});

// *******************************************************************************

/*
*   Button: Insert annotation to project
*/
$("#saveTextButton").click(function(e)
{
    var id = project.getAnnotations().length + 1;
    var ind = new SceneIndication();
    ind = ind.ball(null, APP.result, {id: id, color: [1,0,0,1]});
    ind.active = false;
    ind.time = 0.0;

    ind.update = function(dt)
    {
        this.time += dt;
        if(!this.active)
            this.color = [1,0,0,1];
        else
            this.color = [1, 0.3 + Math.sin(this.time*5), 0.3 + Math.sin(this.time*5), 1];
    }
    
    setParent(obj, ind);

    // se anade a la lista de anotaciones del proyecto
    project.insertAnotation(id, camera, APP.result, $("#message-text").val());
    $("#message-text").val("")
});

/*
*   Key: Click #saveTextButton
*/
$('#message-text').keyup(function(e) 
{
    e.preventDefault();
    if(e.keyCode == 13)
        $("#saveTextButton").click();    
});

$('.pro-info').keyup(function(e) 
{
    e.preventDefault();
    project._description = $(this).val();
});

$('#coord-btn').click(function(e) 
{
    var lat = parseFloat($("#lat").val());
    var lng = parseFloat($("#lon").val());
    project._coordinates.lat = lat;
    project._coordinates.lng = lng;
    initMap(lat, lng);
});

$("#lat").keypress(onlyNumbers);
$("#lon").keypress(onlyNumbers);

/*
*   Button: Clear configuration of meter in the project
*/
$("#restore-meter").click(function(){
    project.restoreMeter();
})

/*
*   Button: Delete all annotations in project
*/
$("#delete-anot-btn").click(function() {
    
    if(!project.getAnnotations().length)
        return;
    
    if(confirm("¿Estas seguro?"))
        project.deleteAllAnotations( obj );
});

/*
*   Button: Enable deleting a project at the main page
*/
$("#delete-project").click(function() {
    
    delete_project_active = true;
    alert("Selecciona proyecto a eliminar:");
});

/*
*   Button: Change visibility of the annotations
*   in canvas
*/
$(".viz_on").click(function() 
{
    if(obj.children.length)
        var visible = obj.children[0].flags.visible;
    APP.showElements(obj.children, visible);
    
    var extra = visible === false ? "" : "_off";
    var tooltip = visible === false ? "Mostrar" : "Esconder";
    $(this).html( "<i class='material-icons'>visibility" + extra + "</i>" +
                "<p class='info_hover_box'>" + tooltip + "</p>");
});

/*
*   Button: Show/Hide the distances measured table
*/
$("#show_dt").click(function() 
{
//    console.log("showing/hiding distances table");
    showing["t1"] = !showing["t1"];
    
    var table = $('#distances-table');
    revealDOMElements(table, showing["t1"]);
});

/*
*   Button: Show/Hide the segments distances measured table
*/
$("#show_dst").click(function() 
{
//    console.log("showing/hiding segments distances table");
    showing["t2"] = !showing["t2"];
    
    var table = $('#segment-distances-table');
    revealDOMElements(table, showing["t2"]);
});

/*
*   Button: Show/Hide the area measured table
*/
$("#show_areat").click(function() 
{
//    console.log("showing/hiding areas table");
    showing["t3"] = !showing["t3"];
    
    var table = $('#areas-table');
    revealDOMElements(table, showing["t3"]);
});

$("#measure-opt-btn").click(function(){
   
    if($(".sub-btns").css("display") == "none")
    {
        $(this).find("i").html("remove_circle_outline");
        $(".sub-btns").show(); 
    }
    else 
    {
        $(this).find("i").html("add_circle_outline");
        $(".sub-btns").hide(); 
    }
});


/*
*   PROJECT STUFF
*/

$("#formUploadProject").on('submit', function(e)
{
    console.log("uploading project");
    e.preventDefault();
    $('#GSCCModal').modal('hide');   
    
    //Cogemos los valores y quitamos el comportamiento por defecto del botón submit
    var values = getFormValues(this);
    
    // Por si el nombre del proyecto tiene espacios!
    var project_id = uncapitalizeFirstLetter(values["idProyecto"].replace(/ /g, '_'));

    // Enviar tambien la informacion de en que usuario estamos
    // para subir los ficheros a la carpeta que le corresponde
    
    var formData = new FormData(this);
    var user = getQueryVariable("user") || "guest";
    formData.append("user", user);
    
    var urlMesh = project_id + "/"; 
    var urlTexture = project_id + "/"; 
    
    var listaExtra = [];
    
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
            var urlPdf = "data/" + user + "/" + project_id + "/"; 
            var auxList = input[0]["value"].split('\\');
            var namePdf = auxList[auxList.length - 1];
            urlPdf = urlPdf + namePdf;
            
            var objectPdf = {"type": "pdf", "data": urlPdf};
            
            listaExtra.push(objectPdf);
        } else if (nameInput.includes("image")) {
            var urlImagen = "data/" + user + "/" + project_id + "/"; 
            var auxList = input[0]["value"].split('\\');
            var nameImagen = auxList[auxList.length - 1];
            urlImagen = urlImagen + nameImagen;
            
            var objectImage = {"type": "image", "data": urlImagen};
            
            listaExtra.push(objectImage);
        }
        
    });
    
    if (!project_id.length || !values["autor"].length || !values["lugar"].length || !values["latitud"].length || !values["longitud"].length) {
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
    
    /* 
    *   Se permite crear unas rotaciones básicas en el primer uso de la mesh,
    *   así que ahora están vacías. Lo relativo a un metro también se guardará
    *   en el json del proyecto.
    */
    
    var jsonFicheroPrincipal = {
        "id": project_id,
        "descripcion": "desc",
        "autor": values["autor"],
        "lugar": values["lugar"],
        "coordenadas": {"lat": values["latitud"], "lng": values["longitud"]},
        "render":{
            "id": project_id, 
            "mesh":urlMesh, 
            "texture":
                [urlTexture],
              "rotaciones":[], 
            "metro": -1
        },
        "extra": listaExtra,
        "anotaciones": [],
        "medidas": [],
        "segmentos": [],
        "areas": []
    };
        
    var fileNameString = "data/" + user + "/" + project_id + '.json';
    
    $.ajax({type: "GET",
            dataType : 'json',
            url: 'save_anotation.php',
            data:
            { 
                data: JSON.stringify(jsonFicheroPrincipal), 
                file_name: fileNameString
            }
    });
    
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
    
});

$('#cargarProyecto').click( function() 
{
//    console.log("cargando proyecto");
    $('#GSCCModal').model('hide');
});

$(".save").click(function(){
    
    if(copy === null)
        project.save(); 
    else
    {
        // save copy of the project
        copy.save();
        
        // update the project copy in session storage
        // to avoid getting a not updated version in next
        // fills
        sessionStorage.setItem("project", JSON.stringify(copy));
    }
    
});

/*
*   Opening more links in Extra info
*/

$('#videoLink').click(function () 
{
    var src = 'https://www.youtube.com/embed/VI04yNch1hU;autoplay=1';
    $('#introVideo iframe').attr('src', src);
});

$('#introVideo button.close').on('hidden.bs.modal', function ()
{
    $('#introVideo iframe').removeAttr('src');
});

$('#buttonYoutubeLink').click( function() 
{
    var stringYoutubeLink = '<div class="form-group"><label for="youtube' + (youtubeLinkCounter+1) + '" class="col-lg-2 control-label">Youtube Link</label><div class="col-lg-10"><input type="url" class="form-control" id="youtube' + (youtubeLinkCounter+1) + '" name="youtube' + (youtubeLinkCounter+1) + '"></div></div>';
        
    $('#fieldset').append(stringYoutubeLink);
    youtubeLinkCounter++;
})

$('#buttonPDFLink').click( function() 
{
    var stringPDFLink = '<div class="form-group"><label for="pdfLink' + (pdfLinkCounter+1) + '" class="col-lg-2 control-label">PDF Link</label><div class="col-lg-10"><input type="file" class="form-control" id="pdfLink' + (pdfLinkCounter+1) + '" name="pdfLink' + (pdfLinkCounter+1) + '"></div></div>';
        
    $('#fieldset').append(stringPDFLink);
    pdfLinkCounter++;
})

$('#buttonImageLink').click( function() 
{
    var stringImageLink = '<div class="form-group"><label for="image' + (imagenLinkCounter+1) + '" class="col-lg-2 control-label">Image Link</label><div class="col-lg-10"><input type="file" class="form-control" id="image' + (imagenLinkCounter+1) + '" name="image' + (imagenLinkCounter+1)+ '" ></div></div>';
        
    $('#fieldset').append(stringImageLink);
    imagenLinkCounter++;
})

$('#buttonTextLink').click( function() 
{
    var stringTextLink = '<div class="form-group"><label for="text' + (textLinkCounter+1) + '" class="col-lg-2 control-label">Textos</label><div class="col-lg-10"><input type="text" class="form-control" id="text' + (textLinkCounter+1) + '" name="text' + (textLinkCounter+1) + '"></div></div>';
        
    $('#fieldset').append(stringTextLink);
    textLinkCounter++;
})