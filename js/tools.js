var default_project = null;
var current_project = getQueryVariable("r") || default_project;

var proj_to_delete = "test";
var delete_project_active = false;

var copy = null;
var imagesCounter = 0;

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
        $("#refresh").click();
        
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
        else if(url === 'infoextra.html')
        {
            var preurl = document.location.pathname;
            if(preurl.includes("/modelo.html"))
                // pass project information to reload it later
                sessionStorage.setItem("project", JSON.stringify(project));        
            
            document.location.href = url+"?r="+(id || current_project).toString();        
        }
        else
            document.location.href = url+"?r="+(id || current_project).toString();    
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
                
    var latitud     = lat || project._coordinates.lat;
    var longitud    = lng || project._coordinates.lng;
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

    $("#area-name").html("<textarea id='s_input'></textarea>");
    $("#s_input").focus();
    $("#s_input").keyup(function(e)
    {
        if(e.keyCode == 13){
            project.getArea(id).name = $(this).val();
            $("#area-name").html("<p onclick='setInput(" + id + ")'>" + $(this).val() + "</p>");
            putCanvasMessage("Recuerda guardar...", 2000);
        }
    });
}

function parseExtraJSON(json)
{
//    console.log(json);
    if(!json){
        console.error("empty");
        return;
    }
    
    imagesCounter = 0;
    
    $(".imageli").remove();
    $("#texto").empty();
    $("#pdfs").empty();
    $("#videos").empty();
    
    var el = null;
    for(var e in json){
        el = json[e];
        if (el.type == "image")
        {
            $(".imagenes-aqui").append(build(el.type, el.data));
        }
        else if (el.type == "text")
        {
            $("#texto").append(build(el.type, el.data));
        }
        else if (el.type == "pdf") {
            $("#pdfs").append(build(el.type, el.data));
        }
        else if (el.type == "youtube")
        {
            $("#videos").append(build(el.type, el.data));
        }
    }
    
    updateGallery();
}

/*
* Builds the structure of the aportation to append
* @param type: type of data to build
* @return object with two nodes
*/
function build(type, data)
{
    if(type == "pdf")
        return "<div class='embed-responsive' style='padding-bottom:75vh'>" +
            "<object data='"+ data +"' type='application/pdf' width='100%' height='100%'></object>" +
            "</div>";
    
    if(type == "text")
        return '<p>'+ data +'</p></br>';
    
    if(type == "youtube")
        return '<div align="center" class="embed-responsive embed-responsive-16by9"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+ data +'" frameborder="0" allowfullscreen></iframe></div>';
    
    if(type == "image"){
        var t =  '<li class="imageli"><img src="'+ data +'" class="img-responsive image image' + imagesCounter + '" onclick="select(this)" alt="Responsive image"></li>';
        imagesCounter++;
        return t;
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
    }, ms);
    last_message_id++;
}

/*
* @
*/

function testDialog(options)
{
    options = options || {};
    
    var upperbtn = options.upperbtn || "Añadir punto";
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
                  "<div class='dialog-option' style='display: flex;'>" +
                    "<button id='add-dialog' class='dialog-btn'>" + upperbtn + "</button>" +
                    "</div>" +
                  "<div class='dialog-option' style='display: flex;'>" +
                    "<button id='end-dialog' class='dialog-btn'>" + lowerbtn + "</button>" +
                    "</div>" +
                "</div>";
    
    location.append(html);
    $( ".draggable" ).draggable();
    
    if(options.hideupper)
        $("#add-dialog").hide();
    if(options.hidelower)
        $("#end-dialog").hide();
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