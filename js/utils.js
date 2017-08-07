var keys = {};
var KEY_W = 87;
var KEY_A = 65;
var KEY_S = 83;
var KEY_D = 68;
var KEY_F = 70;
var KEY_SPACE = 32;

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
*/
function revealDOMElements( elements, showing )
{   
    var list = [].concat(elements);
    
    for(var i = 0; i < list.length; ++i)
        if(showing)
            list[i].fadeIn();
        else
            list[i].fadeOut();
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
        error: function(error)
            {
                console.log(error)
            },
            success:function(data)
            {
            $('#project').html(data.id + "<span class='caret'></span>");
            if(window.parseJSON)
            {
                parseJSON(data);
                // LOAD ALWAYS AFTER GETTING DATA
                loadMapsAPI();
            }
        }
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
      modifyRotations(e.currentTarget);
  });
  
  $('input[type=range]').rangeslider({
    polyfill: false
  });
    
};


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
        project.deleteAnotation(data);
    }
}


