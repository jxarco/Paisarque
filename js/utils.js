var keys = {};
var KEY_W = 87, KEY_A = 65, KEY_S = 83, KEY_D = 68, KEY_F = 70, KEY_B = 66;
var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40;
var KEY_SPACE = 32, KEY_ESC = 27;

var PLANTA = 0, ALZADO = 1;

// default user
var current_user = "guest";

/*
* Server session stuff
*/

var PAS = {
    recover: function()
    {
        if(localStorage.length)
        {
            session = JSON.parse(localStorage.session);
            current_user = session.user.username;    
        }
    }
}

/*
* Return query variable from the url
*/

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

/*
* Add script to html
* Used for loading Google Maps API always after
* setting coordinates.
*/

function addScript( url, callback ) {
    var script = document.createElement( 'script' );
    if( callback ) script.onload = callback;
    script.type = 'text/javascript';
    script.src = url;
    document.body.appendChild( script );  
}

/*
* Hide or show DOM element passed as parameter
* @method revealDOMElements
* @param {list} or {jquery selector} 
* @param {bool}
* @param {object}
*/
function revealDOMElements( elements, showing, options )
{   
    var list = [].concat(elements);
    options = options || {};
    
    for(var i = 0; i < list.length; ++i)
        if(showing){
            list[i].fadeIn();
        }
            
        else
        {
            if(options.e == "")
                list[i].hide();
            else
                list[i].fadeOut();
        }
            
}

/*
* Capitalize first letter of a string
* passed as parameter
*/

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function uncapitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

/*
* Loads the important data from the current project
* and executes init function located at parseJSON.
* AJAX
*/

function loadJSON()
{
    $.ajax({dataType: "json",
        url: "data/" + current_project + '.json',
        error: function(err)
        {
            console.error(err)
        },
        success:function(data)
        {
            $('#project').html(data.id + "<span class='caret'></span>");
            if(APP.parseJSON)
            {
                APP.parseJSON(data);
                // LOAD ALWAYS AFTER GETTING DATA
                loadMapsAPI();
            }
        }
    });
}

/*
*  Dragging stuff
*/

function allowDrop(ev) {
    ev.preventDefault();
    $("#drag-cont").addClass("drag-cont-over");
}

function disallowDrop(ev) {
    $("#drag-cont").removeClass("drag-cont-over");
}

function drag(ev) {
    ev.dataTransfer.setData("data", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("data");
    
    if(ev.target.id === "drag-cont")
    {
        $("#drag-cont").removeClass("drag-cont-over");
//        console.log(data);
        project.deleteAnotation(data);
    }
}

function equals(a, b) {
  return (Math.abs(a[0] - b[0]) <= 0.1) && (Math.abs(a[1] - b[1]) <= 0.1) && (Math.abs(a[2] - b[2]) <= 0.1);
};


var onlyNumbers = function(e) {
    var a = [];
    var k = e.which;

    for (i = 48; i < 58; i++)
        a.push(i);
    
    //comma
    //a.push(44);
    //period
    a.push(46);
    
    if (!(a.indexOf(k)>=0))
        e.preventDefault();
};

 window.download = function(mesh, format)
{
    var file = null;
    if(format == "wbin")
        file = mesh.encode("wbin");
    else
        file = mesh.encode("obj");
    var url = URL.createObjectURL( new Blob([file]) );
    var element = document.createElement("a");
    element.setAttribute('href', url);
    element.setAttribute('download', "mesh." + format );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}