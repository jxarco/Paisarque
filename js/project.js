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
	data = data || {};
    
    this._uid = last_project_id++;
    this._json = data;
    
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
    this._anotations = [];
    var len = data.anotaciones.length || 0;
    
    for(var i = 0; i < len; i++)
    {
        var cam = {
            "position": data.anotaciones[i].camera_position,
            "target": data.anotaciones[i].camera_target,
            "up": data.anotaciones[i].camera_up
        };
        
        this.insertAnotation( data.anotaciones[i].id, cam, data.anotaciones[i].position, data.anotaciones[i].text );
    }
    
    // rotations
    this._rotations = data.render.rotaciones || {};
    
    //distances
    this._meter = data.render.metro || -1;
}

/*
*  @prototype insertExtra
*  Insert extra information to the _extra list.
*  - type: data type (pdf, image, etc)
*  - data: path to data (or link)
*/
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

/*
*  @prototype rename
*  Renames project (ID!!)
*  - name: new name
*/
Project.prototype.rename = function( name )
{
    var new_name = name.replace(/ /g, '_');
    new_name = new_name.charAt(0).toLowerCase() + string.slice(1);
    
	this._id = new_name;
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
    
    // fixing some bugs
    var c_position = vec3.fromValues(camera.position[0], camera.position[1], camera.position[2]);
    var c_target = vec3.fromValues(camera.target[0], camera.target[1], camera.target[2]);
    var c_up = vec3.fromValues(camera.up[0], camera.up[1], camera.up[2]);
    
    // se pone en el documento html y ademas que cuando se apreta a la anotacion se cambia a la camara con la que estaba
    var totalString = '<tr a id="' + id + '" draggable="true" ondragstart="drag(event)" onclick="lookAtAnot( camera, [' + c_position  + "], [" + c_target + "], [" + c_up + '], ' + id + ')">'+ "<td>" + id + "</td>" + "<td>" + status + "</td>"
    +"</tr>";
    
    $("#anotacion_tabla").append(totalString);
}

Project.prototype.getAnnotations = function()
{
    return this._anotations;
}

/*
*  @prototype deleteAnotation
*  Deletes a single annotation
*  - id: id of the annotation to delete
*/
Project.prototype.deleteAnotation = function( id )
{
    console.log("to delete: " + id);
    console.log(this._anotations);
    
    //anotations list
    var index = null;
	for(var i = 0; i < this._anotations.length; ++i)
        if(this._anotations[i].id == id)
                index = i;
         
    if(index === null)
        throw("no annotation to delete");
    
    //table
    $("#" + (index+1)).remove();
    
    // reorder table
    for(var i = index; i < this._anotations.length; ++i)
    {
        
        var rowindex = i + 1;
        var row = $("#" + rowindex);
        var sub = row.attr("id") - 1;
        row.attr("id", sub);
        this._anotations[i].id = sub;
    }
    
    // list
    this._anotations.splice(index, 1);
    
    // scene
    for(var i = 0; i < obj.children.length; ++i)
        if(obj.children[i].id == id)
        {
            obj.children[i].destroy();
            return;
        }
}

/*
*  @prototype deleteAllAnotations
*  Deletes all annotations
*  - obj: current global mesh of the project
*/

Project.prototype.deleteAllAnotations = function( obj )
{
	this._anotations = [];
    
    $('#anotacion_tabla').empty();
    
    // nos quedamos con OBJ y GRID
    obj.children.splice(0, obj.children.length);
}

/*
*  Rotations
*  @class Project
*/

Project.prototype.getRotations = function()
{
    return this._rotations;
}

/*
*  @prototype setRotations
*  Sets the current rotations to the project
*  - rotation: array list of the object rotations
*/

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

/*  
*   @prototype save
*   Guardar todos los datos a disco
*   Se trata de sobreescribir (o no) el json original,
*   con los atributos actuales del proyecto
*/
Project.prototype.save = function( overwrite, extra )
{
    overwrite = overwrite || true;
    extra = extra || "";
    
    var project = this._user + "/" + this._id;
    
    if(!overwrite)
        project += extra;
    
    var path = "data/" + project + '.json';
    
    var json = {
        "id": this._id,
        "autor": this._author,
        "lugar": this._location,
        "coordenadas": {"lat": this._coordinates.lat, "lng": this._coordinates.lng},
        "render":{"id": this._id, "mesh": this._mesh, "texture": this._textures,
                  "rotaciones": this._rotations, "metro": this._meter},
        "extra": this._extra,
        "anotaciones": this._anotations
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
