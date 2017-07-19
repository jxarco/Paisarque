/*
* Server session stuff
*/



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
* Capitalize first letter of a string
* passed as parameter
*/

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
* Loads the anotation data from the current project
* Once has succeded loads the rest of the data
* AJAX
*/

function loadANOTfromJSON()
{
    $.ajax({dataType: "json",
    url: "data/"+current_project+'_anotacion.json',
    error:function(error){console.log(error)},
    success: function(data){
        if(window.parseJSONANOT) {
            parseJSONANOT(data);
            loadDATAfromJSON();
        }
    }
   });

}

/*
* Loads the important data from the current project
* and executes init function located at parseJSON.
* AJAX
*/

function loadDATAfromJSON()
{
    $.ajax({dataType: "json",
        url: "data/" + current_project + '.json',
        error:function(error){console.log(error)},
        success:function(data){
            $('#project').html(data.id + "<span class='caret'></span>");
            if(window.parseJSON) {
                parseJSON(data);
                //console.log(data);  
                latitud = data["coordenadas"]["lat"];
                longitud = data["coordenadas"]["lng"];
                lugar = data["lugar"];

//                console.log("latitud y longitud configuradas");  
                // LOAD ALWAYS AFTER GETTING DATA
                loadMapsAPI();
            }
        }
    });
}
