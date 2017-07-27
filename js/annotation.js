/**
* Annotation class to hold an annotation data
* @class Annotation
*/

function Annotation()
{
	if(this.constructor !== Annotation)
		throw("You must use new to create a new annotation");
	this._ctor();
}

Annotation.prototype._ctor = function()
{
    this._id = -1;
    
	this._camera_position = vec3.create();
    this._camera_target = vec3.create();
    this._camera_up = vec3.create();
    
    this._position = vec3.create();
    
    this._status = "status by default";
}

Annotation.prototype.set = function(id, camera, position, status)
{
    this._id = id;
    
	this._camera_position = vec3.copy();
    this._camera_target = vec3.create();
    this._camera_up = vec3.create();
    
    this._position = vec3.create();
    
    this._status = "status by default";
}

/*
*  @class Annotation
*  @prototype FROM_JSON
*  - data: information about the annotation in JSON
*/
Annotation.prototype.FROM_JSON = function( data )
{
    data = data || {};
    
    this._id = data.id;
    
	this._camera_position = data.camera_position;
    this._camera_target = data.camera_target
    this._camera_up = data.camera_up
    
    this._position = data.position;
    
    this._status = data.text;
}

/*
*  @class Annotation
*  @prototype TO_JSON
*  - result: object to fill
*/
Annotation.prototype.TO_JSON = function( result )
{
     result = {
        "id": this._id,
        "camera_position": this._camera_position,
        "camera_target": this._camera_target,
        "camera_up": this._camera_up,
        "text": this._status,
        "position": {
            "0": this._position[0],
            "1": this._position[1],
            "2": this._position[2],
        }
    };
}