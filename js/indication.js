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
		mesh: "cube"
	});
    
    ball.description = "config";
    ball.flags.ignore_collisions = true;
    options = options || {};
    
    if(options)
        {
            ball.flags.depth_test = options.depth_test;
            ball.render_priority = 19;
            if(options.type == "view"){
                ball.color = [0.3,0.2,0.8,1];           
                ball.shader = null;
            }
            ball.id = options.id;
            if(options.color)
                ball.color = options.color;
        }
            
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
    scene.root.addChild(grid);
}