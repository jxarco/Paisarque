/**
* Indication class return scene nodes as balls to 
* indicate distances configurations
* @class Indication
*/

function Indication()
{
	if(this.constructor !== Annotation)
		throw("You must use new to create a new annotation");
	this._ctor();
}

/*
*  @class Indication
*  @prototype SceneIndication
*  returns the scene node created
*/
Indication.prototype.SceneIndication = function(scene, position, options)
{
    var ball = new RD.SceneNode();
    ball.description = "config";
    ball.color = [0.3,0.8,0.1,1];
    ball.mesh = "sphere";
    ball.shader = "phong";
    ball.layers = 0x4;
    ball.flags.ignore_collisions = true;
    scene.root.addChild(ball);                
    ball.position = position;
    
    options = options || {};
    
    if(options)
        ball.flags.depth_test = options.depth_test;
    
    return ball;
}