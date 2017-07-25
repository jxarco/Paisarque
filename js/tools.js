var default_project = null;
var current_project = getQueryVariable("r") || default_project;

var proj_to_delete = "test";
var delete_project_active = false;

// GET DATA FROM JSONS

// this function calls the other
// so we are getting all necessary data
if(current_project !== null)
    loadJSON();
    
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

function showCompletePath(current_user)
{
    $.ajax( {
        url: 'show_cp_path.php',
        type: 'POST',
        success: function() {
            document.location.href = 'inicio.php?user=' + current_user;
        }
    } );
}

function loadContent(url, project)
{
    if(!delete_project_active)
    {
        console.log("loading content " + url);
        document.location.href = url+"?r="+(project || current_project).toString();    
    }
    else
    {
        var array = project.split('/');
        var user = array[0];
        var project = array[1];
        
        deleteProject(user, project);
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