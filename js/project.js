/**
* Project class to hold the project data
* @class Project
*/

var last_project_id = 0;

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
    
    this._mesh = data.render.mesh;
    this._textures = [];
    
    for(var i = 0; i < data.render.texture.length; ++i)
        this._textures.push(data.render.texture[i]);    
    
    this._extra = data.extra;
    
    // anotations
    this._anotations = data.anotaciones || [];
    
    // rotations
    this._rotations = data.render.rotaciones || {};
    
    //distances
    this._meter = data.render.metro;
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

Project.prototype.getAnnotations = function()
{
    return this._anotations;
}

Project.prototype.insertAnotation = function( id, camera, position, status )
{
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
    
    // se pone en el documento html y ademas que cuando se apreta a la anotacion se cambia a la camara con la que estaba
    var totalString = '<tr a onclick="lookAtAnot( camera, [' + camera.position  + "] , [" + camera.target + "],[" + camera.up + '], ' + id + ')">'+ "<td>" + id + "</td>" + "<td>" + status + "</td>"
    +"</tr>";
    
    $("#anotacion_tabla").append(totalString);
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
//        console.log(this._anotations[i].id);
    }
    
    this._anotations.splice(index, 1);
}

Project.prototype.deleteAllAnotations = function( scene )
{
	this._anotations = [];
    
    $('#anotacion_tabla').empty();
    
    // nos quedamos con OBJ y GRID
    scene.root.children.splice(2, scene.root.children.length);
}

/*
*  Rotations
*  @class Project
*/

Project.prototype.getRotations = function()
{
    return this._rotations;
}

Project.prototype.setRotations = function( rotation )
{
    var r0 = rotation[0];
    var r1 = rotation[1];
    var r2 = rotation[2];
    var r3 = rotation[3];
    
    this._rotations = [{"r0": r0},
        {"r1": r1},
        {"r2": r2},
        {"r3": r3}
    ];
    
}

/*
*  JSON
*  @class Project
*/

Project.prototype.save = function()
{
    /*  
    *   Guardar todos los datos a disco
    *   Se trata de sobreescribir el json original,
    *   con los atributos actuales del proyecto
    */
    
    var overwrite = true;
    
    var project = this._user + "/" + this._id;
    
    if(!overwrite)
        project += "_test";
    
    var path = "data/" + project + '.json';
    
    var json = {
        "id": this._id,
        "autor": this._author,
        "lugar": this._location,
        "coordenadas": {"lat": this._coordinates.lat, "lng": this._coordinates.lng},
        "render":{"id": this._id, "mesh": this._mesh, "texture": this._textures,
                  "rotaciones": this._rotations, "metro": this._meter},
        "extra": this._extra
    };
        
    $.ajax({
            type: "GET",
            //dataType : 'json',
            url: 'save_to_disc.php',
            data: { 
                data: JSON.stringify(json),
                file: path
            },
            succes: function(response){
                console.log("SAVED!!");
            },
            error: function(error){
                console.log("error");
                console.log(error);
            }
    });
}

Project.prototype.delete = function()
{
    /*  
    *   Vaciar proyecto para cuando se hace logout o 
    *   se cambia de proyecto
    */
    
    
}
