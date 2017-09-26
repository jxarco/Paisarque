var extraCounter = null;

$("#tools-tab .btn.tool-btn").click(function(){
    
    var e = $(this);
    var all = $("#tools-tab .btn.tool-btn");
    
   if(!e.hasClass("pressed")){
        // clear previous
        all.removeClass("pressed");
        // add new onpoint or remove from the same one
        e.addClass("pressed");
    }
});

/* EXPORT STUFF */

$(".export-pdf").click(function(){
    
    var user = current_user;
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var options = {
            title: project_name,
            user: user,
            extype: type
        }
    
    jsToPDF(options);
});

$(".export-json").click(function(){
    
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var csv = JSON.stringify(copy[type], null, 2);
    
    var options = {
        file: "export_" + project_name + type + ".json",
        csv: csv
    }
    
    jsToJSON(this, options);
});

$(".export-xls").click(function(){
    
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var csv = convertToCSV(copy[type]);
    
    var options = {
        file: "export_" + project_name + type + ".csv",
        csv: csv
    }
    
    jsToCSV(this, options);
});

/* EXTRA STUFF */

/* 
* Adding any type of extra to the list of _extra in the project
* from URL
*/
$(".add_extra").click(function(){
    
    var from = "#" + $(this).data("from");
    var type = $(this).data("type");
    var data = $(from).val();
    var name = null;
    
    if(copy === null)
    {
        console.error("no project in this html");
        return 0;
    }
    
    if(copy._extra.length)
        extraCounter = copy._extra[copy._extra.length-1].name.split("_")[1];
    else
        extraCounter = -1;
    
    extraCounter++;
    var name = "extra_" + extraCounter;

    if(data == "")
        return 0;
        
    copy.pushExtra(name, type, data);
    $(from).val("");
    parseExtraJSON(copy._extra);
});

// refresh all extra list
$(".refresh").click(function(){
    parseExtraJSON(copy._extra, {parseAll: true});
});

// upload image from disc
$("#formAddImage").on('submit', function(e)
{
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
        
        // add image to project
        if(copy._extra.length)
            extraCounter = copy._extra[copy._extra.length-1].name.split("_")[1];
        else
            extraCounter = -1;

        extraCounter++;
        var name = "extra_" + extraCounter;
        
        copy.pushExtra(name, "image", urlImage);
    });
    
    $('#loadingModal').modal('show');   
    
    //  UNCOMMENT TO DEBUG
    //  return 0;
    //
    
    $.ajax( {
        url: 'server/php/uploadImage.php',
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
    parseExtraJSON(copy._extra);
});

// *******************************************************************************

// FORMS; ENTER -> SUBMIT
$('.form-signin').each(function() {
        
    $(this).find('input').keyup(function(e) {
            // Enter pressed?
             if(e.keyCode == 13) {
               $("#signin-btn").click();
            }
    });
});

/*
*   Insert annotation to project
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
*   Enter trigger clicks
*/
$('#message-text').keyup(function(e) 
{
    e.preventDefault();
    if(e.keyCode == 13)
        $("#saveTextButton").click();    
});

// save the project description
$('.pro-info').keyup(function(e) 
{
    e.preventDefault();
    project._description = $(this).val();
});

/* 
* get the input values to modify the project 
* coordinates location
*/
$('#coord-btn').click(function(e) 
{
    var lat = parseFloat($("#lat").val());
    var lng = parseFloat($("#lon").val());
    project._coordinates.lat = lat;
    project._coordinates.lng = lng;
    initMap(lat, lng);
    putCanvasMessage("Recuerda guardar...", 3000);
});

$("#lat").keypress(onlyNumbers);
$("#lon").keypress(onlyNumbers);

/*
*   Delete all annotations in project
*/
$("#delete-anot-btn").click(function() {
    
    if(!project.getAnnotations().length)
    {
        putCanvasMessage("No hay anotaciones", 3000, {type: "error"});
        return;
    }
    
    else if(confirm("¿Estas seguro?")){
        project.deleteAllAnotations( obj );
        putCanvasMessage("¡Borrado!", 3000);
    }
        
});

/*
*   Enable deleting a project at the main page
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
    APP.anot_visible = !APP.anot_visible;
    APP.showElements(obj.children, APP.anot_visible);
    
    var extra = APP.anot_visible === false ? "" : "_off";
    var tooltip = APP.anot_visible === false ? "Mostrar" : "Esconder";
    $(this).html( "<i class='material-icons'>visibility" + extra + "</i>" +
                "<p class='info_hover_box'>" + tooltip + "</p>");
});

/*
*   Button: Show/Hide the distances measured table
*/
$("#show_dt").click(function() 
{
    APP.disableAllFeatures({no_msg: true});
    showing["t1"] = !showing["t1"];
    
    var table = $('#distances-table');
    var btn = $('#measure-btn');
    revealDOMElements([table, btn], showing["t1"]);
});

/*
*   Button: Show/Hide the segments distances measured table
*/
$("#show_dst").click(function() 
{
    APP.disableAllFeatures({no_msg: true});
    showing["t2"] = !showing["t2"];
    
    var table = $('#segment-distances-table');
    var btn = $('#measure-s-btn');
    revealDOMElements([table, btn], showing["t2"]);
});

/*
*   Button: Show/Hide the area measured table
*/
$("#show_areat").click(function() 
{
    APP.disableAllFeatures({no_msg: true});
    showing["t3"] = !showing["t3"];
    
    var table = $('#areas-table');
    var btn = $('#measure-opt-btn');
    revealDOMElements([table, btn], showing["t3"]);
});

/* 
* interface changing when click
*/
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
* holds the action of taking a snapshot of the canvas
*/
$("#capture-scene").click(function(){
   
    // clear capturing box
    APP.disableAllFeatures({no_msg: true});
    putCanvasMessage("Capturando...", 1500);
    
    // get final canvas
    var canvas = gl.snapshot(0, 0, renderer.canvas.width, renderer.canvas.height);
    
    function on_complete( img_blob )
		{
			var url = URL.createObjectURL( img_blob );
			var img = new Image();
			img.src = url;
            img.className = "download-image";
            $("#capturing").append("<a href='"+url+"' download='screenshot.png' class='btn table-btn'>Descargar captura</a>");
            $("#capturing").append("<a onclick='' class='btn table-btn'>Añadir al proyecto</a>");
			$("#capturing").append( img );
            $("#capturing").append("<a onclick='APP.disableAllFeatures()' class='btn table-btn'>Cancelar</a>").fadeIn();
            putCanvasMessage("¡Capturado! Ahora puedes guardar la imagen o añadirla al proyecto.", 5000);
		}
    
    canvas.toBlob( on_complete, "image/png");
});

/*
*   PROJECT STUFF
*/

$("#formUploadProject").on('submit', function(e)
{
    console.log("preparing to upload project...");
    $('#GSCCModal').modal('hide');   
    
    e.preventDefault();
    var values = getFormValues(this);
    var formData = new FormData(this);
    
    // Enviar tambien la informacion de en que usuario estamos
    // para subir los ficheros a la carpeta que le corresponde
    
    var project_id = values["idProyecto"];
    
    var user = getQueryVariable("user");
    formData.append("user", user);
    
    var urlMesh = project_id + "/"; 
    var urlTexture = project_id + "/"; 
    
    $(':file').each(function() {
        
        console.log("file");
        
        var input = $(this);   
        var nameInput = input[0]["id"];
        
        if (nameInput == "mesh") {
            var auxList = input[0]["value"].split('\\');
            var nameMesh = auxList[auxList.length - 1];
            urlMesh = urlMesh + nameMesh;
        } else if (nameInput == "textura"){
            var auxList = input[0]["value"].split('\\');
            var nameTexture = auxList[auxList.length - 1];
            urlTexture = urlTexture + nameTexture;
        }
    });
    
    var jsonFicheroPrincipal = {
        "id": project_id,
        "descripcion": "nodesc",
        "autor": values["autor"],
        "lugar": values["lugar"],
        "coordenadas": {"lat": values["latitud"], "lng": values["longitud"]},
        "render":{
            "id": project_id, 
            "mesh": urlMesh, 
            "texture":
                [urlTexture],
              "rotaciones":[], 
            "metro": -1
        },
        "extra": [],
        "anotaciones": [],
        "medidas": [],
        "segmentos": [],
        "areas": []
    };
    
    var fileNameString = "../../data/" + user + "/" + project_id + '.json';
    
    $.ajax({
        type: "POST",
        dataType : 'json',
        url: 'server/php/save_to_disc.php',
        data:
        {
            data: JSON.stringify(jsonFicheroPrincipal), 
            file: fileNameString
        }
    });
    
    $('#loadingModal').modal('show');   
    
    $.ajax( {
        url: 'upload.php',
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false, 
        success: function() {
            $('#loadingModal').modal('hide');               
            // volver a cargar el contenido
//            location = location;
        },
        error: function(err) {
            console.error(err);
            $('#loadingModal').modal('hide');               
        }
    } );
    
    // Resetear campos del form
    $(this).trigger("reset");
    
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
