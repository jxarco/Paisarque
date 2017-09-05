var default_project = null;
var current_project = getQueryVariable("r") || default_project;

var proj_to_delete = "test";
var delete_project_active = false;

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
        window.onresize = resize;
        init_sliders(); // canvas rotations
    },
    loadExtra: function(data){
        
        if(current_project !== null)
            {
//                var data = window.extra;
                if(window.parseExtraJSON)
                    parseExtraJSON(data);
                else 
                    console.log("claro q no");
            }
            
    }
};

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

function loadContent(url, project)
{
    if(!delete_project_active)
    {
        console.log("loading content " + url);
        
        if(url === 'inicio.php')
        {
            document.location.href = url+"?user=" + current_user;
            return;
        }
        else
            document.location.href = url+"?r="+(project || current_project).toString();    
    }
    else
    {
        var dproject = project.split('/')[1];
        deleteProject(current_user, dproject);
    }
}

function loadMapsAPI()
{
    addScript( 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrcNsufDO4FEmzoCO9X63ru59CUvCe2YI&callback=initMap' );
}

function initMap() 
{
    // https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
                
    var latitud = project._coordinates.lat;
    var longitud = project._coordinates.lng;
    var location = project._location;
    
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

function parseExtraJSON(json)
{
//    console.log(json);
    if(!json){
        console.err("empty");
        return;
    }
    var el = null;
    for(var e in json){
        el = json[e];
        if (el.type == "image") {
            $("#imagenes").append(build(el.type, el.data));
        } else if (el.type == "text") {
            $("#texto").append(build(el.type, el.data));
        } else if (el.type == "pdf") {
            $("#pdfs").append(build(el.type, el.data));
        } else if (el.type == "youtube") {
            $("#videos").append(build(el.type, el.data));
        }
    }

}

/*
* Builds the structure of the aportation to append
* @param type: type of data to build
* @return object with two nodes
*/
function build(type, data)
{
    if(type == "pdf")
    {
        var t = "<div class='embed-responsive' style='padding-bottom:75vh'>"
            t += "<object data='"+ data +"' type='application/pdf' width='100%' height='100%'></object>"
            t += "</div>";
        return t;        
    }
    
    if(type == "text")
        return '<p>'+ data +'</p></br>';
    
    if(type == "youtube")
        return '<div align="center" class="embed-responsive embed-responsive-16by9"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+ data +'" frameborder="0" allowfullscreen></iframe></div>';
    
    if(type == "image")
    {
        return '<img src="'+ data +'" class="img-responsive image" alt="Responsive image"> ';
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

/*
* @param elements: nodes list
* @param description: delete only by description
*/
function destroySceneElements(elements, description)
{
    for(var i = 0; i < elements.length; ++i)
    {
        if(elements[i] === null)
            return;
        
        if(!description)    
            elements[i].destroy();
        else if(description == elements[i].description)
            elements[i].destroy();
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
var last_message_id = 0;
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
