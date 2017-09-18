var default_project = null;
var current_project = getQueryVariable("r") || default_project;

var proj_to_delete = "test";
var delete_project_active = false;

var copy = null;
var separator = "__________________________________________________\n";

// LOAD DATA FROM JSON

// prevent of NO LOGIN
// COMMENT TO DEBUG IN LOCAL
//if(session === null)
//    $("#all").hide();
//

var LOADER = {
    load: function(){
        if(current_project !== null)
            loadJSON();
        window.onresize = APP.resize;
        init_sliders(); // canvas rotations
    },
    loadExtra: function(){
        var data = sessionStorage.getItem("project");
        copy = new Project({}, current_user, {no_construct: true});
        copy.fill(data);
        parseExtraJSON(copy._extra, {parseAll: true});
        SlickJS.init();
    },
    loadProject: function(){
        var data = sessionStorage.getItem("project");
        copy = new Project({}, current_user, {no_construct: true});
        copy.fill(data);
    }
};

// FINISH GETTING DATA FROM JSONS

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
        "data/" + user + "/" + project,
    ]
    
    $.ajax({
      url: 'deleteFile.php',
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
    if(!delete_project_active)
    {
        console.log("loading content " + url);
        
        if(url === 'inicio.php')
            document.location.href = url+"?user=" + current_user;
            
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
    else
    {
        var dproject = id.split('/')[1];
        deleteProject(current_user, dproject);
    }
}

function loadMapsAPI()
{
    addScript( 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrcNsufDO4FEmzoCO9X63ru59CUvCe2YI&callback=initMap' );
}

function initMap(lat, lng) 
{
    // https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
    //console.log(typeof project._coordinates.lat);
    
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

function setInput(id)
{
//    console.log(id);

    $("#area-name" + id).html("<textarea id='s_input'></textarea>");
    $("#s_input").focus();
    $("#s_input").keyup(function(e)
    {
        if(e.keyCode == 13){
            
            var value = $(this).val();
            
            if(value == "")
                $("#area-name" + id).html("<p onclick='setInput(" + id + ")'>" + project.getArea(id).name + "</p>");
            else
            {
                project.getArea(id).name = value;
                $("#area-name" + id).html("<p onclick='setInput(" + id + ")'>" + value + "</p>");
                putCanvasMessage("Recuerda guardar...", 2000);
            }
        }
        
        if(e.keyCode == 27)
            $("#area-name" + id).html("<p onclick='setInput(" + id + ")'>" + project.getArea(id).name + "</p>");
    });
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
//        return '<li class="imageli"><img src="'+ sampleObj.data +'" class="img-responsive image ' + sampleObj.name + '" onclick="select(this, ' + "'image'" + ')" alt="Responsive image"></li>';
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
* @param parent: node to add child to it
* @param son: node to transform 
* @return object with two nodes
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
    camera.position = position_camera;
    camera.target = target_camera;
    camera.up = up_camera;
    
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
* @param text: message to display in canvas
* @param ms: time to display before hidding
* @param options: color, background-color, font-size 
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
    
    var location = $("#placeholder");
    var html = "<div " +
                  "class='draggable ui-widget-content' " +
                  "style='" +
                  "width: 30%; " +
                  "margin-left: 60%; " +
                  "margin-top: 20px; " +
                  "text-align: center;'>" +
                  "<h5>Herramientas</h5>" +// text 
                  "<div class='dialog-option'>" +
                    "<button id='add-dialog' class='dialog-btn'>" + upperbtn + "</button>" +
                    "</div>" +
                  "<div class='dialog-option'>" +
                    "<button id='camera-mode' class='dialog-btn'>Mover cámara</button>" +
                    "</div>" +
                  "<div class='dialog-option'>" +
                    "<button id='end-dialog' class='dialog-btn'>" + lowerbtn + "</button>" +
                    "</div>";
    
    if(options.scale)
        html +=   "<div class='dialog-option'>" +
                    "<input id='scale-input' placeholder='Escala (metros)'></input><button id='help-dialog' class='dialog-btn info'><i class='material-icons'>info_outline</i></button>" +
                    "</div>" + 
                  "<div class='dialog-option help'>" +
                    "<p>Escribe en el cuadro de texto la escala con la que vas a medir el modelo 3D. Por ejemplo, si introduces 0.1, la distancia total entre los puntos que selecciones será igual a 0.1 metros. Por defecto, la distancia será 1 metro.</p>" +
                  "</div>";
                    
    html += "</div>";
    
    location.append(html);
    $( ".draggable" ).draggable();
    
    if(options.hideupper)
        $("#add-dialog").hide();
    if(options.hidelower){
        $("#end-dialog").hide();
    }
    
    $("#camera-mode").click(function(){
        context.onmousedown = function(e) {}
        $("#myCanvas").css("cursor", "default");  
    });
        
}
    
/*
* Sliders initialization
*/

var init_sliders = function() {
  var slider = document.querySelector('#s1');
  var slider2 = document.querySelector('#s2');
  var slider3 = document.querySelector('#s2');
  
  $(document).on('input', 'input[type="range"]', function(e) {
      APP.modifyRotations(e.currentTarget);
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





