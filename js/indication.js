/**
* SceneIndication class return scene nodes as balls to 
* indicate distances configurations
* @class Indication
*/

function SceneIndication()
{
	if(this.constructor !== SceneIndication)
		throw("You must use new to create a new annotation");
//    return this._ctor(scene, position, options);
}

/*
*  @class SceneIndication
*  @prototype SceneIndication
*  returns the scene node created
*/
SceneIndication.prototype.ball = function(scene, position, options)
{
    var ball = new RD.SceneNode({
		position: position,
		color: [0.3,0.8,0.1,1],
        layers: 0x4,
		mesh: "sphere"
	});
    
    ball.description = "config";
    
    options = options || {};
    
    if(options && options.depth_test)
        ball.flags.depth_test = options.depth_test;
        
    if(options && options.color)
        ball.color = options.color;
        
    if(options && options.id)
        ball.id = options.id;
    
    if(options && options.type)
        if(options.type == "view")
            ball.color = [0.258, 0.525, 0.956,1];           
        
    if(scene !== null)
        scene.root.addChild(ball);                
    
    return ball;
}

/*
*  @class SceneIndication
*  @prototype grid
*  returns a scene node equal to a grid
*/
SceneIndication.prototype.grid = function(size, options)
{
    options = options || {};
    
    var grid = new RD.SceneNode();
    var grid_mesh = GL.Mesh.grid({size:size});
    renderer.meshes["grid"] = grid_mesh;
    grid.flags.visible = options.visible;
    grid.name = "grid";
    grid.mesh = "grid";
    grid.primitive = gl.LINES;
    grid.color = [0.5, 0.5, 0.5, 1];
    grid.scale([50, 50, 50]);
    
    return grid;
}