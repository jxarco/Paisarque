var youtubeLinkCounter = 0;
var pdfLinkCounter = 0;
var imagenLinkCounter = 0;
var textLinkCounter = 0;

/*
*   Button: Insert annotation to project
*/
$("#saveTextButton").click(function(e)
{
    var ball = new RD.SceneNode();
    var id = project.getAnnotations().length + 1;
    
    ball.color = [1,0,0,1];
    ball.id = id;
    ball.shader = "phong";
    ball.mesh = "sphere";
    ball.layers = 0x4;
    ball.flags.ignore_collisions = true;
    ball.active = false;
    ball.time = 0.0;
//    scene.root.addChild(ball);

    ball.update = function(dt)
    {
        this.time += dt;
            
        if(!this.active)
            this.color = [1,0,0,1];
        else
            this.color = [1, 0.3 + Math.sin(this.time*5), 0.3 + Math.sin(this.time*5), 1];
    }

    ball.position = result;
    
    // set ball parent
    var parentInverse = mat4.create();
    var sonGlobal = mat4.create();
    mat4.invert(parentInverse, obj.getGlobalMatrix());
    sonGlobal = ball.getGlobalMatrix();
    obj.addChild(ball);
    mat4.multiply(ball._local_matrix, parentInverse, sonGlobal);

    // se coge el texto correspondiente
    var text = document.getElementById("message-text").value;
    
    // vaciar texto
    document.getElementById("message-text").value = "";
    
    // se anade a la lista de anotaciones del proyecto
    project.insertAnotation(id, camera, result, text);
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

$('#comment').keyup(function(e) 
{
    e.preventDefault();
    project._description = $(this).val();
});


/*
*   Button: Delete all annotations in project
*/
$("#delete-anot-btn").click(function() 
{
    if(!project.getAnnotations().length)
        return;
    
    if(confirm("¿Estas seguro?"))
        project.deleteAllAnotations( obj );
});

/*
*   Button: Change visibility of the annotations
*   in canvas
*/
$("#viz_on").click(function() 
{
    viz_anotations = !viz_anotations;
    changeVizAnotInCanvas(viz_anotations);
    
    var extra = viz_anotations === false ? "" : "_off";
    var tooltip = viz_anotations === false ? "Mostrar anotaciones" : "Esconder anotaciones";
    $(this).html( "<div class='info_hover_box'>" + tooltip + "</div><i class='material-icons'>visibility" + extra + "</i>" );
});

/*
*   Button: Show/Hide the distances measured table
*/
$("#show_dt").click(function() 
{
//    console.log("showing/hiding distances table");
    showing_dist_table = !showing_dist_table;
    
    var table = $('#distances-table');
    revealDOMElements(table, showing_dist_table);
    if(!showing_dist_table)
    {
        var elements = [ball, ball2, linea];
        destroySceneElements(elements);
    }
});

/*
*   Button: Show/Hide the segments distances measured table
*/
$("#show_dst").click(function() 
{
    console.log("showing/hiding segments distances table");
    showing_seg_dist_table = !showing_seg_dist_table;
    
    var table = $('#segment-distances-table');
    revealDOMElements(table, showing_seg_dist_table);
//    if(!showing_seg_dist_table)
//    {
//        var elements = [ball, ball2, linea];
//        destroySceneElements(elements);
//    }
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
    
    var urlMesh = project_id + "/"; 
    var urlTexture = project_id + "/"; 
    
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
        "segmentos": []
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

$("#test").click(function(){
   project.save(); 
});

/*
*   Extra info stuff
*/

$('#videoLink').click(function () 
{
    var src = 'https://www.youtube.com/embed/VI04yNch1hU;autoplay=1';
    // $('#introVideo').modal('show'); <-- remove this line
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