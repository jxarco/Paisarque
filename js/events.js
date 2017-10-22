var extraCounter = null;
var input_files = [];

/*
* General stuff
*/
// FORMS; ENTER -> SUBMIT
$('.form-signin').each(function() {
        
    $(this).find('input').keyup(function(e) {
            // Enter pressed?
             if(e.keyCode == 13) {
               $("#signin-btn").click();
            }
    });
});

/******************************************************************************************/

/*
* inicio.html stuff
*/ 
// project search tool
$('#search-bar').keyup(function(e) 
{
    e.preventDefault();
    
    // pressing enter
    var params = {};
    // by default filter
    params["name"] = $(this).val().toLowerCase();
    
    // load optionsl filter
    var filter = $("#filters-bar").find(":selected").val().toLowerCase();
    if(filter != ""){
        delete params["name"];
        params[filter] = $(this).val().toLowerCase();
    }
    
    loadProjectsTable(params);
});

$(".pagination").click(function(){
   
    var current_page = parseInt(getQueryVariable("pag")) || 0;
    var next_page = current_page + 1;
    var previous_page = current_page - 1;
    
    // click left
    if($(this).hasClass("l")){
        if(!current_page)
            return;
        else{
            var href = "inicio";
            if(previous_page)
                href += "?pag=" + previous_page;
            
            window.location.href = href;
        }
    }
    //click right
    if($(this).hasClass("r")){
        if(!current_page)
            window.location.href += "?pag=1";
        else
            window.location.href = "inicio?pag=" + next_page; 
    }
});

//Enable deleting a project at the main page
$("#delete-project").click(function() {
    
    delete_project_active = true;
    alert("Selecciona proyecto a eliminar:");
});

/*
* Proyecto TAB
*/ 
// slide hidden tabs in information
$(".slide-tab").click(function(){
    var target_id = $(this).data("target");
    var target = $(target_id);
    
    if(target.css("display") == "none")
        target.slideDown('slow'); 
    else
        target.slideUp('slow'); 
});
/*
* Herramientas TAB
*/ 
// add active class to button in tools 
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

$(".save").click(function()
 {
    if(copy === null)
        project.save(); 
    else
        copy.save();// save copy of the project for extra
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
* Anotations TAB
*/
//Insert annotation to project
$("#saveTextButton").click(function(e)
{
    var id = project.getAnnotations().length + 1;
    
    var ind = new SceneIndication({
        position: APP.result,
        id: id,
        active: false,
        color: [1,0,0,1],
        time: 0.0,
        onupdate: "blink"
    });
    
    setParent(GFX.model, ind);

    // se anade a la lista de anotaciones del proyecto
    project.insertAnotation(id, GFX.camera, APP.result, $("#message-text").val());
    $("#message-text").val("")
});

//Enter triggers click
$('#message-text').keyup(function(e) 
{
    e.preventDefault();
    if(e.keyCode == 13)
        $("#saveTextButton").click();    
});

/*
*   Delete all annotations in project
*/
$("#delete-anot-btn").click(function() {
    
    if(!project.getAnnotations().length)
    {
        var msg = {
            es: "No hay anotaciones",
            cat: "No hi ha cap anotació",
            en: "No annotations to delete"
        }
        putCanvasMessage(msg, 3000, {type: "error"});
        return;
    }
    
    else if(confirm("¿Estas seguro?"))
        project.deleteAllAnotations( GFX.model );
});

/*
*   Button: Change visibility of the annotations
*   in canvas
*/
$(".viz_on").click(function() 
{
    APP.anot_visible = !APP.anot_visible;
    APP.showElements(GFX.model.children, APP.anot_visible);
    
    var lang = localStorage.getItem("lang");
    var options = {
        _show: {es: "Mostrar", cat: "Mostrar", en: "Show"},
        _hide: {es: "Esconder", cat: "Amagar", en: "Hide"},
    }
    
    var extra = APP.anot_visible === false ? "" : "_off";
    var tooltip = APP.anot_visible === false ? options["_show"][lang] : options["_hide"][lang];
    $(this).html( "<i class='material-icons'>visibility" + extra + "</i>" +
                "<p class='info_hover_box'>" + tooltip + "</p>");
});

/*
* EXTRA STUFF
*/

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
    
    var values = getFormValues(this);
    
    /*       guest/grave       */
    var project_id = current_project;

    var formData = new FormData(this);
    var user = current_user;
    formData.append("user", user);
    formData.append("id", project_id);
    
    var urlImage = "litefile/files/" + user + "/projects/" + copy._id + "/";
    
    $(':file').each(function() {
        var input = $(this);
        var auxList = input[0]["value"].split('\\');
        var nameMesh = auxList[auxList.length - 1];
        urlImage += nameMesh;
        
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
    // Upload file
    
    for(var i = 0, f; f = input_files[i]; i++)
    {
        if(f.constructor == File)
		{
			var fileReader = new FileReader();
            
             fileReader.onload = (function(theFile) {
                return function(e) {
                    var arrayBuffer = this.result;
                    var fullpath = current_user + "/projects/" + copy._id + "/" + theFile.name;
                    
                    session.uploadFile( fullpath, arrayBuffer, 0, function(){
                        $('#loadingModal').modal('hide');
                        // Resetear campos del form
                        $(this).trigger("reset");
                        parseExtraJSON(copy._extra);
                    });
                };
              })(f);
            
            fileReader.readAsArrayBuffer( f );
		}
    }
});

/*
* EXPORT STUFF
*/
$(".export-file").click(function(e)
{
//    e.preventDefault();
    var user = current_user;
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var params = {
            title: project_name,
            user: user,
            extype: type,
            element: this,
        }
    
    fileToBLOB(params);
});

$(".export-pdf").click(function(){
    
    var user = current_user;
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var params = {
            title: project_name,
            user: user,
            extype: type
        }
    
    jsToPDF(params);
});

$(".export-json").click(function(){
    
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var content = JSON.stringify(copy[type], null, 2);
    var filename = "export_" + project_name + type + ".json";
    
    LiteGUI.downloadFile( filename, content );
});

$(".export-xls").click(function(){
    
    var project_name = current_project.split("/")[1];
    var type = $(this).attr("class").split(" ")[1];
    
    var csv = convertToCSV(copy[type]);
    var filename = "export_" + project_name + type + ".csv";
    
    LiteGUI.downloadFile( filename, csv );
});

/*
*   PROJECT STUFF
*/

$(function() {
    $('#idProyecto').on('keypress', function(e) {
        if (e.which == 32)
            return false;
    });
});

// prevent copy-paste the password to confirmation
$("#password2").on("paste", function(e){
    e.preventDefault();
})

$("#formForgotPassword").on('submit', function(e)
{
    e.preventDefault();
    var values = getFormValues(this);
    
    if(values["password"] !== values["password2"])
        throw( "invalid confirmation" );
    
    LiteFileServer.login( QueryString["email"], QueryString["pass"], function(session, result){
        if( session.status == LiteFileServer.LOGGED )
        {
            onLoggedIn(session);
            session.setPassword(QueryString["pass"], values["password"], function(){
                $("#tools-forgot-password").hide();
                $("#content").append("<h3>Password changed</h3>")
            });
        }
        else
            bootbox.alert(result.msg);
    });	
});

$("#formUploadProject").on('submit', function(e)
{
    console.log("preparing to upload project...");
    $('#GSCCModal').modal('hide');   
    
    /*
    UPLOAD FILE
    * @param {String} fullpath
    * @param {ArrayBuffer||Blob||File||String} data 
    * @param {Object} extra could be category, metadata (object or string), preview (in base64)
    */
    
    e.preventDefault();
    var values = getFormValues(this);
    var formData = new FormData(this);
    
    // Enviar tambien la informacion de en que usuario estamos
    // para subir los ficheros a la carpeta que le corresponde
    
    var project_id = values["idProyecto"].toLowerCase();
    
    var user = current_user;
    formData.append("user", user);
    
    var urlMesh = project_id + "/"; 
    var urlTexture = project_id + "/"; 
    
    $(':file').each(function() {
        
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
      
    // json object to save with information
    // about the entire project
    var o = {
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
        "areas": [],
        "config":
        {
            "auto-save":false
        }
    };
    
    var on_complete = function(){
        console.log("upload/folder completed");
    }
    
    var on_error = function(err){
        console.error(err);
    }

    /* 
    *   Upload configuration file as JSON
    */
    var path = current_user + "/projects/" + project_id + ".json";
    session.uploadFile( path, JSON.stringify(o), 0, on_complete, on_error);
    
    $('#loadingModal').modal('show');  

    path = current_user + "/projects/" + project_id + "/";
    session.createFolder(path, on_complete, on_error);
    
    var n_files = input_files.length;
    
    for(var i = 0, f; f = input_files[i]; i++)
    {
        if(f.constructor == File)
		{
			var fileReader = new FileReader();
            
             fileReader.onload = (function(theFile) {
                return function(e) {
                    var arrayBuffer = this.result;
                    var fullpath = current_user + "/projects/" + project_id + "/" + theFile.name;
                    
                    session.uploadFile( fullpath, arrayBuffer, 0, function(){
                        $('#loadingModal').modal('hide');     
                        if(i == (n_files - 1))
                            location = location;
                    }, on_error );
                };
              })(f);
            
            fileReader.readAsArrayBuffer( f );
		}
    }
    
    input_files = [];
    $(this).trigger("reset");
    
});

/*
*  Util stuff for handling file events
*/

function handleFileSelect(evt) {
        var files = evt.target.files;

        var output = [];
        for (var i = 0, f; f = files[i]; i++){
          console.warn(f);
            input_files.push(f);
        }
          
    }

if(document.getElementById('mesh') && document.getElementById('textura')){
    document.getElementById('mesh').addEventListener('change', handleFileSelect, false);
    document.getElementById('textura').addEventListener('change', handleFileSelect, false);
}

if(document.getElementById('image')){
    document.getElementById('image').addEventListener('change', handleFileSelect, false);
}
