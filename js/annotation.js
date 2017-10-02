/**
* Annotation class to hold an annotation data
* @class Annotation
*/

function Annotation(id, camera, position, text)
{
	if(this.constructor !== Annotation)
		throw("You must use new to create a new annotation");
	this._ctor();
    if(id !== null)
        this.set(id, camera, position, text);
}

Annotation.prototype._ctor = function()
{
    this._id = -1;
    
	this._camera_position = vec3.create();
    this._camera_target = vec3.create();
    this._camera_up = vec3.create();
    
    this._position = vec3.create();
    
    this._text = "anot text";
}

Annotation.prototype.set = function(id, camera, position, text)
{
    this._id = id;
    
    for(var i in camera.position)
	   this._camera_position[i] = camera.position[i];
    for(var i in camera.target)
	   this._camera_target[i] = camera.target[i];
    for(var i in camera.up)
	   this._camera_up[i] = camera.up[i];
    
     for(var i in position)
	   this._position[i] = position[i];
    
    this._text = text;
}

/*
*  @class Annotation
*  @method FROM_JSON
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
    
    this._text = data.text;
}

/*
*  @class Annotation
*  @method TO_JSON
*  return {object}
*/
Annotation.prototype.TO_JSON = function()
{
     return {
        "id": this._id,
        "camera_position": this._camera_position,
        "camera_target": this._camera_target,
        "camera_up": this._camera_up,
        "text": this._text,
        "position": {
            "0": this._position[0],
            "1": this._position[1],
            "2": this._position[2],
        }
    };
}