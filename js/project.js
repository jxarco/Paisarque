/**
* Project class to hold the project data
* @class Project
*/

var last_project_id = 0;
var last_anotation_id = 1;

function Project( data )
{
	if(this.constructor !== Project)
		throw("You must use new to create a Project");
	this._ctor( data );
}

Project.prototype._ctor = function( data )
{
	this._uid = last_project_id++;
    this._json = data;
    
    var data = data || {};
    
	// data
	this._id = data.id;
    this._user = "guest";
	this._author = data.autor;
    this._location = data.lugar;
    this._coordinates = data.coordenadas;
    this._render = data.render;
    this._extra = data.extra;
    
    // anotations
    this._anotations = data.anotaciones || [];
    
    // rotations
    this._rotations = data.render.rotaciones;
}

Project.prototype.insertExtra = function( type, data )
{
    var dataURL = "";
    
//	if(type === 'pdf' || type === 'image')
//        dataURL = 'data/' + this._user + '/' + this._id + '/';
//    if(type === 'text' || type === 'youtube')
//        dataURL = data;
    
    this._extra.push( {
        type: type,
        data: data
    });
}

Project.prototype.rename = function( name )
{
	this._id = name;
}

/*
*  Anotations
*  @class Project
*/

/*
*  @prototype insertAnotation
*  - camera: contains position, target and up
*  - position: x y z of the anotation
*  - status: text of the anotation
*/
Project.prototype.insertAnotation = function( camera, position, status )
{
    var id = last_anotation_id++;
    
    this._anotations.push({
        "id": id,
        "camera_position": camera.position,
        "camera_target": camera.target,
        "camera_up": camera.up,
        "text": status,
        "position": {
            "0": position[0],
            "1": position[1],
            "2": position[2],
        }
    });
}

Project.prototype.deleteAllAnotations = function( scene, current_project )
{
	this._anotations = [];
    
    $('#anotacion_tabla').empty();
    
    // nos quedamos con OBJ y GRID
    scene.root.children.splice(2, scene.root.children.length)
    
    var fileNameString = "data/" + current_project + '_anotacion.json';

    /*$.ajax({type: "GET",
            dataType : 'json',
            url: 'save_anotation.php',
            data: { data: "", file_name:fileNameString},
            success: function(data){ 
                console.log("TABLA ACTUALIZADA");
            }                    
    });*/
}

Project.prototype.deleteAnotation = function( id )
{
    var index = null;
    
	for(var i = 0; i < this._anotations.length; ++i)
    {
        if(this._anotations[i].id === id)
            {
                index = i;
                break;
            }
        console.log(this._anotations[i].id);
    }
    
    this._anotations.splice(index, 1);
}

/*
*  Rotations
*  @class Project
*/

Project.prototype.setRotations = function( rotations )
{
    this._rotations = rotations;
}

/*
*  JSON
*  @class Project
*/

Project.prototype.save = function()
{
    // guardar todos los datos al json
}










