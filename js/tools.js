var default_project         = null;
var delete_project_active   = false;
var current_project = getQueryVariable("r");

var copy = null; // copy of the project
var current_user = "guest"; // default user
var session = null;

/*
* Server session stuff
*/
var PAS = {
    recover: function()
    {
        if(localStorage.length)
        {
            var last_session = JSON.parse(localStorage.session);
            var new_session = new LiteFileServer.Session();
            
            copySession(new_session, last_session);
            session = new_session;
            
            current_user = session.user.username;   
        }else{
            console.warn("no session involved");
            current_user = getQueryVariable('user') || getQueryVariable('r').split("/")[0];
        }
    }
}

var LOADER = {
    // 3d tab
    load: function(){
        if(current_project !== null)
            loadJSON();
        window.onresize = APP.resize;
        init_sliders(); // canvas rotations
    },
    // info extra tab
    loadExtra: function(){
        var data = sessionStorage.getItem("project");
        copy = new Project({}, current_user, {no_construct: true});
        copy.fill(data);
        parseExtraJSON(copy._extra, {parseAll: true});
        SlickJS.init();
    },
    // rest of tabs
    loadProject: function(){
        var data = sessionStorage.getItem("project");
        copy = new Project({}, current_user, {no_construct: true});
        copy.fill(data);
    }
};

/*
* Loads the important data from the current project
* and executes init function located at parseJSON.
* AJAX
*/

function loadJSON()
{
    var project = current_project.split("/")[1];
    
    $.ajax({
        dataType: "json",
        url: "litefile/files/" + current_user + "/projects/" + project  + '.json',
        error: function(err)
        {
            console.error(err)
        },
        success:function(data)
        {
            if(APP.parseJSON)
            {
                APP.parseJSON(data);
                // LOAD ALWAYS AFTER GETTING DATA
                loadMapsAPI();
                
                // clear tmp files
                $.ajax({
                  url: 'server/php/emptyFolder.php',
                  data: {
                    'folder': "../../data/uploadedfiles/files",
                    }
                });
                    
                // get data from DATA variable and fill any gap
                parseDATA(0, null);
            }
        }
    });
}
// FINISH GETTING DATA FROM JSONS

function parseDATA(active, options)
{
    if(!DATA || active)
        return 0;
    
    // load by default cubemaps   
    for(var i in DATA.cubemaps)
    {
        var o = DATA.cubemaps[i];
        var src = o.src;
        var pre = o.preview;
        
        var container = $("#cubemaps-in");
        container.append(
            '<div class="responsive">' +
                '<div class="gallery">' +
                    '<img class="cubemap-img" src="data/cubemaps/' + pre + '" data-src="data/cubemaps/' + src + '">' +
                '</div>' +
            '</div>');

        $(".cubemap-img").click(function(){
           var url = $(this).data("src");
            APP.setCubeMap(url);
        });
    }
    
    if(!options)
        return 0;
    
    //
}

function loadProjectsTable(filters)
{
    filters = filters || {};
    var perpage = 5;
    
    $.ajax({
        type: "POST",
        url: 'server/php/projects.php',
        data: {
            'user' : current_user,
            },
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            console.log(filters);
            // do stuff
            var container = $("#tableInicio");
            // clean cont
            container.empty();
            // apply pagination or nothing if few projects
            var len = data.length >= perpage ? perpage : data.length;
            
            for(var i = 0; i < len; i++)
            {
                var file = data[i];
                var user            = file[0];
                var project         = file[1];
                var preview_exists  = file[2];
                var author          = file[3];
                var place           = file[4];
                
                // apply filters
                
                if(filters){
                    if(filters.nombre && !project.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.nombre))
                        continue;    
                    if(filters.autor && !author.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.autor))
                        continue;    
                    if(filters.lugar && !place.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filters.lugar))
                        continue;    
                }

                var folder = user + "/" + project;
                var src = preview_exists ? 
                    "litefile/files/" + user + "/projects/" + project + "/preview.png" :
                    "litefile/files/project-preview.png";
                
                container.append("<tr id='" + project + "' onclick='loadContent(" + '"modelo.html"' + ", " + '"' + folder + '"' + ")'>");
                var row = $("#" + project);
                row.append("<td><img class='project-preview ' src='" + src + "' title='Vista previa de " +                    project + "'></td>");
                row.append("<td>" + capitalizeFirstLetter(project) + "</td>");
                row.append("<td class='w3-hide-small'>" + author + "</td>");
                row.append("<td class='w3-hide-small w3-hide-medium'><div>" + place + "</div></td>");
                container.append("</tr>");
            }
        },
        error: function(err){
            console.error(err);
        }
    });
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
        "../../data/" + user + "/" + project + ".json",
        "../../data/" + user + "/" + project,
    ]
    
    $.ajax({
      url: 'server/php/deleteFile.php',
      data: {'file' : project_to_delete[0],
            'folder': project_to_delete[1],
            },
      success: function (response) {
          document.location.href = 'inicio.php?user=' + user;
          delete_project_active = false;
      }
    });
};

function loadContent(url, id)
{
    if(delete_project_active)
    {
        var dproject = id.split('/')[1];
        deleteProject(current_user, dproject);
        return;
    }
    
    // load content 
    console.log("loading content " + url);
        
    if(url === 'inicio.php'){
        document.location.href = url+"?user=" + current_user;
    }

    else {
        // pass project information to reload it later
        var preurl = document.location.pathname;
        if(preurl.includes("/modelo.html"))
            sessionStorage.setItem("project", JSON.stringify(project));     
        if(preurl.includes("/infoextra.html"))
            sessionStorage.setItem("project", JSON.stringify(copy));     

        document.location.href = url+"?r="+(id || current_project).toString();        
    }
}

function loadMapsAPI()
{
    addScript( 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrcNsufDO4FEmzoCO9X63ru59CUvCe2YI&callback=initMap' );
}

function initMap(lat, lng) 
{
    var latitud     = lat || parseFloat(project._coordinates.lat);
    var longitud    = lng || parseFloat(project._coordinates.lng);
    var location    = project._location;
    
    var marker = {lat: latitud, lng: longitud};
    
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
        center: new google.maps.LatLng(latitud, longitud), zoom: 5
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
        
    var marker = new google.maps.Marker({
        position: marker,
        map: map,
        title: location
    });  
}

function uploadBLOB(e)
{
    var url = e.data("url");
    var path = "litefile/files/" + current_user + "/projects/" + project._id + "/" + makeid(8) + ".png";
    var php_path = "../../" + path;
    
    var on_success = function(){
        // add image to project
        if(project._extra.length)
            extraCounter = project._extra[project._extra.length-1].name.split("_")[1];
        else
            extraCounter = -1;

        extraCounter++;
        var name = "extra_" + extraCounter;

        project.pushExtra(name, "image", path);
        project.save(); // necessary to avoid losing data
    };
    
    $.ajax({
        type: "POST",
        url: 'server/php/uploadURL.php',
        data: {
            'url' : url,
            'path' : php_path
            },
        success: on_success
    });
    
    
    // ASK FOR IT ???
//    session.uploadRemoteFile(url, path, null, function(err){
//        console.error(err);
//    });
}

function setInput(id, type)
{
    var full_id = "#"+type+"-name"+id;
    var old_name = $(full_id).find("p").html();
    
    $(full_id).html("<textarea id='s_input' placeholder='Nombre'></textarea>");
    $("#s_input").focus();
    $("#s_input").keyup(function(e)
    {
        if(e.keyCode == 13){
            
            var value = $(this).val();
            
            if(value == "")
                $(full_id).html("<p onclick='setInput(" + id + ", " + type + ")'>" + old_name + "</p>");
            else
            {
                if(type == "area")
                    project.getArea(id).name = value;
                if(type == "dist")
                    project.getMeasure(id).name = value;
                if(type == "seg")
                    project.getSegmentMeasure(id).name = value;
                
                
                $(full_id).html("<p onclick='setInput(" + id + ", " + type + ")'>" + value + "</p>");
                if(project._auto_save)
                    project.save();
            }
        }
        
        if(e.keyCode == 27)
            $(full_id).html("<p onclick='setInput(" + id + ", " + type + ")'>" + old_name + "</p>");
    });
}

function remove(e){
    
    //           <i>    <td>    <tr>
    var parent = $(e).parent().parent();
    var msr_id = parent.attr("id");
    
    parent.remove();
    
    // coger por id el area o medida y eliminarla
    if(project.getMeasure(msr_id))
        project.deleteDistance(msr_id, "d");
    else if(project.getSegmentMeasure(msr_id))    
        project.deleteDistance(msr_id, "s");
    else if(project.getArea(msr_id))    
        project.deleteDistance(msr_id, "a");
    else
        console.error("Nothing to delete");
}

function show(e)
{
    if(!e.hasClass("on-point")){
        // clear previous
        $(".on-point").removeClass("on-point");
        // add new onpoint or remove from the same one
        e.addClass("on-point");
        
        // render measure
        var id = e.parent().attr("id");
        var type = e.data("type");

        APP.renderMeasure({id: id, type: type});
    }
    else{
        e.removeClass("on-point");
        APP.destroyElements(scene.root.children, "config");
        //APP.disableAllFeatures();
    }
}

function parseExtraJSON(json, flags)
{
    flags = flags || {};
    
//    console.log(json);
    if(!json){
        console.error("empty");
        return;
    }
    
    if(flags.parseAll)
    {
        $(".imagenes-aqui").empty();
        $("#texto").empty();
        $("#pdfs").empty();
        $("#videos").empty();

        var sel = null;
        for(var e = 0; e < json.length; ++e){
            sel = json[e];
            if (sel.type == "image")
            {
                $(".imagenes-aqui").append(build(sel));
            }
            else if (sel.type == "text")
            {
                $("#texto").append(build(sel));
            }
            else if (sel.type == "pdf") {
                $("#pdfs").append(build(sel));
            }
            else if (sel.type == "youtube")
            {
                var embeed = sel.data.split("=")[1];
                $("#videos").append(build(sel, {id: embeed}));
            }
        }    
    }
    else
    {
        var index = json.length - 1;
        var sel = json[index];
        if (sel.type == "image")
            $(".imagenes-aqui").append(build(sel));
        else if (sel.type == "text")
            $("#texto").append(build(sel));
        else if (sel.type == "pdf")
            $("#pdfs").append(build(sel));
        else if (sel.type == "youtube")
        {
            var embeed = sel.data.split("=")[1];
            $("#videos").append(build(sel, {id: embeed}));
        }
        
        SlickJS.refresh();   
    }
}

/*
* Builds the structure of the aportation to append
* @param type: type of data to build
* @return object with two nodes
*/
function build(sampleObj, options)
{
    sampleObj = sampleObj || {};
    options = options || {};
    
    if(sampleObj.type == "image"){
        return '<div><img src="'+ sampleObj.data +'" class="img-responsive image ' + sampleObj.name + '" onclick="select(this, ' + "'image'" + ')" alt="Responsive image"></div>';
    }
    
    if(sampleObj.type == "text"){
        return '<p class="note ' + sampleObj.name + '" onclick="select(this, ' + "'text'" + ')">· '+ sampleObj.data +'</p>';
    }
    
    if(sampleObj.type == "pdf"){
        return '<div class="w3-col m6 ' + sampleObj.name + '" onclick="select(this, ' + "'pdf'" + ')">' +
            '<object class="apt-pdf" data="'+ sampleObj.data +'#view=FitH" type="application/pdf"></object>' +
            '</div>'; 
    }

    if(sampleObj.type == "youtube"){
        return '<div class="w3-col m4 ' + sampleObj.name + '" onclick="select(this, ' + "'youtube'" + ')"><iframe class="apt-video" src="https://www.youtube.com/embed/'+ options.id +'" allowfullscreen></iframe>' +
        '</div>';
    }
        
}

/*
* @param parent {sceneNode} node to add child to it
* @param son {sceneNode} node to transform 
* @return {object} with two nodes
*/
function setParent(parent, son)
{
    var parentInverse = mat4.create();
    var sonGlobal = mat4.create();
    mat4.invert(parentInverse, parent.getGlobalMatrix());
    sonGlobal = son.getGlobalMatrix();
    parent.addChild(son);
    mat4.multiply(son._local_matrix, parentInverse, sonGlobal);
    
    return {
        "parent": parent,
        "son": son
    }
}

function lookAtAnot(camera, position_camera, target_camera, up_camera, anot_id)
{
    // to look at with smooth efect
    camera.direction = position_camera;
    camera.smooth = true;
    
    for(var i = 0; i < obj.children.length; i++)
    {
        var current = obj.children[i];
        if(current.id === anot_id)
            current.active = true;
        else
            current.active = false;
    }
}

/*
* @param text {string} message to display in canvas
* @param ms {number} time to display before hidding
* @param options {object} color, background-color, font-size 
*/
var last_message_id = 999;
function putCanvasMessage(text, ms, options)
{
    var options = options || {};
    
    last_message_id++;
    $("#cont-msg").append(
    "<div class='messages' id='" + (last_message_id) + "'>" + 
        text + 
    "</div>"
        );
    
    var id = "#" + last_message_id;
    
    $(id).css("color", options.color);
    $(id).css("background-color", options.back);
    $(id).css("font-size", options.size);
    
    // default css types if it has
    $(id).addClass(options.type);
    $(id).fadeIn();

    setTimeout(function(){
        $(id).fadeOut();
        $(id).remove();
        
        if(options.callback)
            options.callback();
        
    }, ms);
    last_message_id++;
}

/*
* @
*/

function testDialog(options)
{
    options = options || {};
    
    var upperbtn = options.upperbtn || "Añadir puntos";
    var lowerbtn = options.lower || "Finalizar";
    
    var location = $("#tab-content2-large");
    
    var html = "<div " +
                    "class='draggable ui-widget-content' " +
                  "style='" +
//                  "width: 30%; " +
                  "margin-top: 265px;" +
                  "text-align: center;'>" +
                  "<button title='Cancelar' id='close-dialog' class='btn dialog-btn info'><i class='material-icons'>close</i></button>" +
                  "<div class='dialog-option'>" +
                    "<button id='add-dialog' class='btn dialog-btn'>" + upperbtn + "</button>" +
                    "</div>" +
                  "<div class='dialog-option'>" +
                    "<button id='camera-mode' class='btn dialog-btn'>Mover cámara</button>" +
                    "</div>" +
                  "<div class='dialog-option'>" +
                    "<button id='end-dialog' class='btn dialog-btn'>" + lowerbtn + "</button>" +
                    "</div>";
    
    if(options.scale)
        html +=   "<div class='dialog-option'>" +
                    "<input id='scale-input' placeholder='Escala (metros)'></input><button id='help-dialog' class='btn dialog-btn info'><i class='material-icons'>info_outline</i></button>" +
                    "</div>" + 
                  "<div class='dialog-option help'>" +
                    "<p>Escribe en el cuadro de texto la escala con la que vas a medir el modelo 3D. Por ejemplo, si introduces 0.1, la distancia total entre los puntos que selecciones será igual a 0.1 metros. Por defecto, la distancia será 1 metro.</p>" +
                  "</div>";
                    
    html += "</div>";
    
    location.append(html);
//    $( ".draggable" ).draggable();
    
    if(options.hideupper)
        $("#add-dialog").hide();
    if(options.hidelower){
        $("#end-dialog").hide();
    }
    
    $("#camera-mode").click(function(){
        selectDialogOption($(this));
        context.onmousedown = function(e) {}
        $("#myCanvas").css("cursor", "default");  
    });
    
    $("#close-dialog").click(function(){
        APP.disableAllFeatures();  
    });
        
}

/*
* @param {o} jquery selector from the dialog tools to add class active
*/

function selectDialogOption(o)
{
    var list = [$("#camera-mode"),
    $("#add-dialog")];

    for(var i in list)
        list[i].removeClass("selected");
    
    if(!o.hasClass("selected"))
        o.addClass("selected");
}
    
/*
* Sliders initialization
*/

var init_sliders = function() {
  var slider = document.querySelector('#s1');
  var slider2 = document.querySelector('#s2');
  var slider3 = document.querySelector('#s2');
  
  $(document).on('input', 'input[type="range"]', function(e) {
      APP.adjustSlider(e.currentTarget);
  });
  
  $('input[type=range]').rangeslider({
    polyfill: false
  });
    
};


/* 
* PDF EXPORTING
* Uses the jsPDF library to export javascript to pdf
*/

function jsToPDF(options)
{
    var doc = new jsPDF();
    var pageHeight = doc.internal.pageSize.height - 25;
    
    var user = options.user;
    var project_name = options.title;
    var type = options.extype;
    
    doc.setFontSize(20);
    doc.text(project_name, 20, 20);
    doc.setFontSize(10);
    doc.text("De " + user, 20, 30);
    doc.setFontSize(11);
    
    var body = "";
    var isSummary = type == "summary";
    
    if(type == "detailed" || isSummary)
    {
        // información básica
        body += separator + "Sobre el proyecto\n\n";
        body += "Autor del proyecto: " + copy._author + "\n" +
            "Localización: " + copy._location + "\n" +
            "Latitud-Longitud: [ " + copy._coordinates.lat + " - " + copy._coordinates.lng + " ]\n" +
            "Descripción: " + copy._description + "\n";
        
        // render 3d
        body += separator + "3D\n\n";
        body += "Modelo 3D: " + copy._mesh + "\n" +
            "Texturas:\n";
        
        for(var i = 0; i < copy._textures.length; ++i)
            body += "\t" + copy._textures[i] + "\n";
        
        if(!isSummary)
        {
            // rotaciones
            body += separator + "Rotaciones\n\n";
            if(copy._rotations.length){
                body += "El modelo 3D dispone de una rotación modificada usando como valores:\n";
                body += "\t(" + copy._rotations["0"].r0 + ", " + copy._rotations["1"].r1 + ", " + copy._rotations["2"].r2 + ", " + copy._rotations["3"].r3 + ")\n";
            }
            else
                body += "El proyecto únicamente dispone de las rotaciones por defecto.\n";

             // ESCALA!!!
            body += separator + "Escala\n\n";
            if(copy._meter != -1)
                body += "La relación de escala es de " + copy._meter + " unidades por cada metro.\n";
            else
                body += "La escala no ha sido configurada.\n";

            // anotaciones
            
            body += separator + "Anotaciones realizadas sobre el modelo 3D:\n\n";
            if(copy._anotations.length){
                for(var i = 0; i < copy._anotations.length; ++i)
                {
                    var current = copy._anotations[i];
                    body += "\tID: " + current.id + "\n" +
                        "\tDescripción: " + current.text + "\n" +
                        "\tPosición: (" + current.position[0] + ", " + current.position[1] + ", " + current.position[2] + ")\n" +
                        "\tCámara: (" + current.position[0] + ", " + current.position[1] + ", " + current.position[2] + ")\n";
                }
            }
            else
                body += "El proyecto no contiene anotaciones.\n";
            
            // medidas
            body += separator + "Mediciones realizadas sobre el modelo 3D:\n\n";
            if(copy._measures.length){
                for(var i = 0; i < copy._measures.length; ++i)
                {
                    var current = copy._measures[i];
                    body += "\tID: " + current.id + "\n";
                    body += "\tEtiqueta: " + "Sin etiqueta" + "\n";
                    body += "\tDistancia: " + current.distance + "\n";
                    body += "\tPosición P0: (" + current.x1[0] + ", " + current.x1[1] + ", " + current.x1[2] + ")\n" +
                        "\tPosición P1: (" + current.x2[0] + ", " + current.x2[1] + ", " + current.x2[2] + ")\n";
                }
            }
            else
                body += "El proyecto no contiene mediciones.\n";
        }
        
        if(!isSummary){
            body += separator + "Mediciones por segmentos realizadas sobre el modelo 3D:\n\n";
            if(copy._segments.length){
                for(var i = 0; i < copy._segments.length; ++i)
                {
                    var current = copy._segments[i];
                    body += "\tID: " + current.id + "\n";
                    body += "\tEtiqueta: " + "Sin etiqueta" + "\n";
                    body += "\tDistancia: " + current.distance + "\n";
                    for(var j = 0; j < current.points.length; ++j){
                        var point = current.points[j];
                        body += "\tPosición P" + j + ": (" + point[0] + ", " + point[1] + ", " + point[2] + ")\n";
                    }
                }
            }
            else
                body += "El proyecto no contiene mediciones por segmentos.\n";
        }

        // areas
        if(!isSummary){
            body += separator + "Mediciones de area realizadas sobre el modelo 3D:\n\n";
            if(copy._areas.length){
                for(var i = 0; i < copy._areas.length; ++i)
                {
                    var current = copy._areas[i];
                    body += "\tID: " + current.id + "\n";
                    body += "\tEtiqueta: " + current.name + "\n";
                    body += "\tArea: " + current.area + "\n";
                    for(var j = 0; j < current.points.length; ++j){
                        var point = current.points[j];
                        body += "\tPosición P" + j + ": (" + point[0] + ", " + point[1] + ", " + point[2] + ")\n";
                    }
                }
            }
            else
                body += "El proyecto no contiene mediciones de area.\n";
        }
        
        // extra
        body += separator + "Aportaciones subidas al proyecto:\n\n";

        if(copy._extra.length){
            copy._extra.sort(function(a,b) {
                  if (a.type < b.type)
                       return -1;
                  if (a.type > b.type)
                    return 1;
                  return 0;
                });
            
            for(var i = 0; i < copy._extra.length; ++i)
            {
                var current = copy._extra[i];
                if(current.type == "image")
                    body += "\tImagen (URL): " + current.data + "\n";
                else if(current.type == "pdf")
                    body += "\tURL imagen: " + current.data + "\n";
                else if(current.type == "text")
                    body += "\tNota: " + current.data + "\n";
                else if(current.type == "youtube")
                    body += "\tVídeo (URL): " + current.data + "\n";
            }
        }
        else
            body += "El proyecto no dispone de aportaciones.\n";
        
        var lines = body.split("\n");
        // Y corresponds to the current page height
        var y = 45;
        
        for(var i = 0; i < lines.length; i++)
        {
            doc.text(lines[i], 20, y);            
            y += 7;
            if(y > pageHeight)
            {
                doc.addPage();
                y = 25;
            }
        }
    }
        
    if(type == "aport")
    {
        body = "";
        body += "Aportaciones subidas al proyecto:\n" + separator;
        
        if(copy._extra.length){
            copy._extra.sort(function(a,b) {
                  if (a.type < b.type)
                       return -1;
                  if (a.type > b.type)
                    return 1;
                  return 0;
                });
            
            for(var i = 0; i < copy._extra.length; ++i)
            {
                var current = copy._extra[i];
                if(current.type == "image")
                    body += "\tImagen (URL): " + current.data + "\n";
                else if(current.type == "pdf")
                    body += "\tURL imagen: " + current.data + "\n";
                else if(current.type == "text")
                    body += "\tNota: " + current.data + "\n";
                else if(current.type == "youtube")
                    body += "\tVídeo (URL): " + current.data + "\n";
            }
            body += separator;
        }
        else
        {
            body += "El proyecto no dispone de aportaciones.\n";
            body += separator;
        }
        
        var lines = body.split("\n");
        // Y corresponds to the current page height
        var y = 45;
        
        for(var i = 0; i < lines.length; i++)
        {
            doc.text(lines[i], 20, y);            
            y += 7;
            if(y > pageHeight)
            {
                doc.addPage();
                y = 25;
            }
        }
    }
    
    if(type == "config")
    {
        var lines = JSON.stringify(copy, null, 2).split("\n");
        // Y corresponds to the current page height
        var y = 45;
        
        for(var i = 0; i < lines.length; i++)
        {
            doc.text(lines[i], 20, y);            
            y += 7;
            if(y > pageHeight)
            {
                doc.addPage();
                y = 25;
            }
        }
        
    }
    
    // saving is the same for every option
    doc.save("export_" + project_name + '_' + type + '.pdf');
}

/* 
* JSON EXPORTING
*/
function jsToJSON(element, options)
{
    var csvData = 'data:application/json;charset=utf-8,' + encodeURIComponent(options.csv);
    
    element.href = csvData;
    element.target = '_blank';
    element.download = options.file;
}


/* 
* CSV EXPORTING
*/

function jsToCSV(element, options)
{
    var csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(options.csv);
    
    element.href = csvData;
    element.target = '_blank';
    element.download = options.file;
}

/* 
* Tries to convert the object list format to csv format
*/
 function convertToCSV(list) {
     
     var header = "";
     var str = "";
     
     for(var i = 0; i < list.length; ++i)
     {
        var array = list[i];
        var keys = Object.keys(array); 
         
        for(var j = 0; j < keys.length; ++j)
        {
            header += keys[j];
            if(j == keys.length - 1)
                header += "\n";
            else
                header += ",";
            
            if(typeof array[keys[j]] !== 'object')
                str += array[keys[j]];
            else
                str += JSONtoString( array[keys[j]] );
                
            if(j == keys.length - 1)
                str += "\n";
            else
                str += ",";
         }
     }
     
     var data = header + str;
     return data;
 }
     
/* 
* Tries to pretty print a json in a string
*/
function JSONtoString(sample)
{
    var str = "";
    var keys = Object.keys(sample);
    
    for(var i = 0; i < keys.length; ++i)
    {
        if(typeof sample[keys[i]] !== 'object')
            str += sample[keys[i]];
        else
            str += JSONtoString( sample[keys[i]] );

        if(i != keys.length - 1)
            str += " x ";
     }
    
    return str;
}