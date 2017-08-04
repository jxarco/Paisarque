var project         = null;
var obj             = null;
var placer          = null;
var context         = null;
var scene           = null;
var renderer        = null;
var camera          = null;
var _dt             = 0.0;
var viz_anotations  = true;

// distances
var result          = vec3.create();
var firstPoint      = vec3.create();
var secondPoint     = vec3.create();
var ball            = null;
var ball2           = null;
var linea           = null;
var to_destroy      = [];
var first_measurement       = true;
var showing_dist_table      = false;
var showing_seg_dist_table  = false;

// rotaciones
var setting_rotation    = false;
var subs                = 0;
var adds                = 0;

//
// Functions below this:
//

function parseJSON(json)
{
    if(project === null)
        project = new Project( json, current_user );
    
    if(project._meter !== -1)
    {
        $("#measure-btn").find("div").html("Medir distancia");
        $("#measure-btn").css('opacity', '1'); 
        $("#measure-seg-btn").find("div").html("Medir por segmentos");
        $("#measure-seg-btn").css('opacity', '1'); 
    }
    
    if(project._description !== "nodesc")
        $("#comment").val(project._description);
    
    /****************************************************************/
    /* render stuff*/
    
    var renderData = json.render;
    if(!renderData.mesh) {
        console.err("There is no mesh");
        return;
    }
                                
    var meshURL = renderData.mesh;
    var textureURL = renderData.texture;
                
    if (textureURL.length > 1) {
        console.log("MAS DE UNA TEXTURA");
    }
    
    /*Para calcular el path completo de la mesh*/ 
    
    var string1 = current_project;
    var string2 = meshURL;
    
    string1 = string1.split('/');
    string2 = string2.split('/');
    
    var iNOIncluir;
    
    for (var i = 0; i < string1.length; i++){
        for (var j = 0; j < string2.length; j++) {
            if (string1[i] == string2[j]){
                iNOIncluir = i;
            }
        }
    }
    
    var totalPathMesh = "data/";
    for (var i = 0; i < string1.length; i++) {
        if (i != iNOIncluir)  {
            totalPathMesh = totalPathMesh + string1[i] + '/';
        }
    }
    for (var j = 0; j < string2.length; j++) {
        totalPathMesh = totalPathMesh + string2[j];
        if (j < string2.length-1) {
            totalPathMesh = totalPathMesh + '/';
        } 
    }
    /* Ya tenemos el path completo de la Mesh */ 
    
    /* Para mirar cual es el path completo de la texture*/ 
    
    // por ahora solo cojo la primera textura
    string2 = textureURL[0];
    string2 = string2.split('/');
    
    for (var i = 0; i < string1.length; i++){
        for (var j = 0; j < string2.length; j++) {
            if (string1[i] == string2[j]){
                iNOIncluir = i;
            }
        }
    }
    var totalPathTexture = "data/";
    for (var i = 0; i < string1.length; i++) {
        if (i != iNOIncluir)  {
            totalPathTexture = totalPathTexture + string1[i] + '/';
        }
    }
    for (var j = 0; j < string2.length; j++) {
        totalPathTexture = totalPathTexture + string2[j];
        if (j < string2.length-1) {
            totalPathTexture = totalPathTexture + '/';
        } 
    }
    
    /* Ya tenemos el path completo de la Texture */     
    
    init(current_project, totalPathMesh, totalPathTexture);
}

function init(current_project, meshURL, textureURL)
{
    scene = new RD.Scene();

    //create the rendering context
    context = GL.create({width: window.innerWidth, height:window.innerHeight, alpha:true});
    renderer = new RD.Renderer(context);
    placer = document.getElementById("myCanvas");
    placer.appendChild(renderer.canvas); //attach

    //disable autoload
    renderer.autoload_assets = false;

    //create camera
    camera = new RD.Camera();
    camera.perspective( 45, gl.canvas.width / gl.canvas.height, 1, 1000 );
    camera.lookAt( [100,100,100],[0,0,0],[0,1,0] );

    var pivot = new RD.SceneNode();
    //inner update
    /*pivot.update = function(dt) {
        this.rotate(dt * 0.1,RD.UP);
    }*/
    scene.root.addChild(pivot);

    //create an obj in the scene
    obj = new RD.SceneNode();
    obj.position = [0,0,0];
    obj.color = [1,1,1,1];
    obj.mesh = meshURL;
    
    // tenemos que pensar el caso en que haya mas de una textura
    if (!isArray(textureURL)) {
        obj.texture = textureURL;
    }
    
    // Hacer las rotaciones pendientes
    var rotaciones = project.getRotations();
    
    if(!rotaciones.length)
        console.log("No default rotations");
//        alert("No default rotations. Go to Tools and set a default rotation matrix");
    else
    {
        obj._rotation[0] = rotaciones[0].r0;
        obj._rotation[1] = rotaciones[1].r1;
        obj._rotation[2] = rotaciones[2].r2;
        obj._rotation[3] = rotaciones[3].r3;
        
        obj.updateMatrices();
    }
    
    var makeVisible = function () {
        placer.style.visibility = "visible";
        putCanvasMessage("Recuerda: guarda el proyecto al realizar cambios!", 5000);
        putCanvasMessage("Puedes cancelar cualquier acción con la tecla ESC", 5000);
        if(!rotaciones.length)
            putCanvasMessage("No hay rotaciones por defecto: créalas en Herramientas", 4000, {b_color: "rgba(255, 0, 0, 0.5)"});
    };

    renderer.loadMesh(obj.mesh, makeVisible);
    renderer.loadTexture(obj.texture, renderer.default_texture_settings);
    
    obj.scale([5,5,5]);
    pivot.addChild( obj );
    
    var grid = new RD.SceneNode();
    
    var grid_mesh = GL.Mesh.grid({size:5});
    renderer.meshes["grid"] = grid_mesh;
    grid.flags.visible = false;
    grid.name = "grid";
    grid.mesh = "grid";
    grid.primitive = gl.LINES;
    grid.color = [0.5, 0.5, 0.5, 1];
    grid.scale([50, 50, 50]);
    scene.root.addChild(grid);
        
    // se listan las anotaciones que hay en el fichero correspondiente que es el nombre del proyecto _anotaciones y se dibujan con un circulo rojo en la mesh
    
    var anotaciones = project.getAnnotations();
    
    if(!anotaciones.length)
        console.log("no anotations");
    
    for (var i = 0; i < anotaciones.length; i++) {
        
        var ball = new RD.SceneNode();
        ball.id = anotaciones[i].id;
        ball.color = [1,0,0,1];
        ball.mesh = "sphere";
        ball.shader = "phong";
        ball.layers = 0x4;
        ball.flags.ignore_collisions = true;
        ball.active = false;
        ball.time = 0.0;
        
        var position = [ anotaciones[i].position[0], anotaciones[i].position[1], anotaciones[i].position[2]];
        ball.position = position;
        
        // set ball parent
        var parentInverse = mat4.create();
        var sonGlobal = mat4.create();
        mat4.invert(parentInverse, obj.getGlobalMatrix());
        sonGlobal = ball.getGlobalMatrix();
        obj.addChild(ball);
        mat4.multiply(ball._local_matrix, parentInverse, sonGlobal);

        ball.update = function(dt)
        {
            this.time += dt;
            if(!this.active)
                this.color = [1,0,0,1];
            else
                this.color = [1, 0.3 + Math.sin(this.time*5), 0.3 + Math.sin(this.time*5), 1];
        }
    }

    //global settings
    var bg_color = vec4.fromValues(0.921, 0.921, 0.921, 1);

    //main render loop
    var last = now = getTime();
    requestAnimationFrame(animate);
    function animate() {
        requestAnimationFrame( animate );

        last = now;
        now = getTime();
        var dt = (now - last) * 0.001;
        renderer.clear(bg_color);
        renderer.render(scene, camera);
        scene.update(dt);
//        console.log(keys[83]);
    }
    
    resize();
    context.animate(); //launch loop
    
    context.onupdate = function(dt) {
        _dt = dt;
    }

    context.onmousemove = function(e)
    {
        
        mouse = [e.canvasx, gl.canvas.height - e.canvasy];
        if (e.dragging && e.leftButton) {
            camera.orbit(-e.deltax * 0.1 * _dt, RD.UP,  camera._target);
            camera.orbit(-e.deltay * 0.1 * _dt, camera._right, camera._target );
        }
        if (e.dragging && e.rightButton) {
            camera.moveLocal([-e.deltax * 0.5 * _dt, e.deltay * 0.5 * _dt, 0]);
        }
    }

    context.onmousewheel = function(e)
    {
        if(!e.wheel)
            return;
        
        camera.position = vec3.scale( camera.position, camera.position, e.wheel < 0 ? 1.01 : 0.99 );
    }

    context.onkeydown = function(e)
    {
        keys[e.keyCode] = true;        
    }
    
    context.onkeyup = function(e)
    {   
        keys[e.keyCode] = false;        
        
        if(e.keyCode === 13) // Enter
            {
                if(!setting_rotation)
                    return;
                
                setting_rotation = false;
                scene.root.children[1].flags.visible = setting_rotation;
    
                if(setting_rotation)
                {
                    $("#cardinal-axis").fadeIn();
                    $('.sliders').fadeIn();        
                }
                else
                {
                    $("#cardinal-axis").fadeOut();
                    $('.sliders').fadeOut();        
                }
                
                project.setRotations(obj._rotation);
            }
        
        if(e.keyCode === 27) // ESC
            {
                // disable all features
                putCanvasMessage("Cancelado", 1000);
                
                context.onmousedown = function(e) {};
                setting_rotation = false;
                scene.root.children[1].flags.visible = setting_rotation;
    
                if(setting_rotation)
                {
                    $("#cardinal-axis").fadeIn();
                    $('.sliders').fadeIn();        
                }
                else
                {
                    $("#cardinal-axis").fadeOut();
                    $('.sliders').fadeOut();        
                }
                
                destroySceneElements(scene.root.children, "config");
            }
    }
    
    context.captureMouse(true);
    context.captureKeys();
}

function anotar(modoAnotacion)
{
    if (modoAnotacion) {
        console.log("Modo anotación activado")
        $("#desAnot").css('opacity', '1');
        $("#actAnot").css('opacity', '0.2');
        
        
        context.onmousedown = function(e) 
        {
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var node = scene.testRay( ray, result, undefined, 0x1, true );
            
            // Si ha habido colision, se crea un punto y se abre una ventana de texto para escribir la anotacion
            if (node)
            {
                // No hacer aqui ningún $(something).click o lo que sea para no repetir
                // event listeners

                // se abre la ventana de texto para escribir
                $('#modalText').modal('show');
                //$('#message-text').focus();
            }
        }
    } else if (!modoAnotacion) {
        console.log("Modo anotación desactivado");
        $("#desAnot").css('opacity', '0.2');
        $("#actAnot").css('opacity', '1');
        context.onmousedown = function(e) {}
    }

}

/* ************************************************* */
// Anotations viz tools

function changeVizAnotInCanvas(showing)
{
    for(var i = 0; i < obj.children.length; i++)
        {
            var current = obj.children[i];
            
            if(!showing){
                current.flags.visible = false;
                //console.log("deleting viz to ball");
            }
            else
                current.flags.visible = true;
        }
}

// FIX IT
function changeSizeAnotInCanvas(operation)
{
    // lets say op_type = 1 to add
    // and 0 to substract
    var ADD = true;
    var SUBS = false;
    var last_node = null;
    
    for(var i = 0; i < obj.children.length; i++)
    {
        var current = obj.children[i];

        if(operation === ADD)
            {
//                var m = current.getLocalMatrix();
//                current.scale([1.1, 1.1, 1.1]);
//                
//                mat4.multiply(current._local_matrix, current._local_matrix, m);
//                
//                adds++;
            }
                
        else if(operation === SUBS)
            {
//                current.scale([0.9, 0.9, 0.9]);
//                subs++;
            }
    }
}

/* ************************************************* */
// Distances tools

function medirMetro()
{
//    console.log("midiendo cuanto es un metro");
//    alert("Selecciona dos puntos, la linea recta que los une corresponderá a un metro");
    putCanvasMessage("Selecciona dos puntos, la linea recta que los une corresponderá a un metro", 2500);
    
    var primerPunto     = true;
    var segundoPunto    = false;
    var ball_first      = null;
    var ball_sec        = null;
    
    context.onmousedown = function(e) 
    {
        
        if (primerPunto) {
        
            var result = vec3.create();
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var node = scene.testRay( ray, result, undefined, 0x1, true );
            
            if (node) {
                ball_first = new RD.SceneNode();
                ball_first.description = "config";
                ball_first.color = [0,1,0,1];
                ball_first.mesh = "sphere";
                ball_first.shader = "phong";
                ball_first.layers = 0x4;
                ball_first.flags.ignore_collisions = true;
                scene.root.addChild(ball_first);                
                ball_first.position = result;
                firstPoint = result;
                
                primerPunto = false;
                segundoPunto = true;
            }
            
        } else if (segundoPunto) {
            
            var result = vec3.create();
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var node = scene.testRay( ray, result, undefined, 0x1, true );
            
            // Si ha habido colision, se crea un punto y se abre una ventana de texto para escribir la anotacion
            if (node) {
                ball_sec = new RD.SceneNode();
                ball_sec.description = "config";
                ball_sec.color = [0,1,0,1];
                ball_sec.mesh = "sphere";
                ball_sec.shader = "phong";
                ball_sec.layers = 0x4;
                ball_sec.flags.ignore_collisions = true;
                scene.root.addChild(ball_sec);                
                ball_sec.position = result;
                secondPoint = result;
                
                var newPoint = vec3.create();
                newPoint[0] = Math.abs(firstPoint[0] - secondPoint[0]);
                newPoint[1] = Math.abs(firstPoint[1] - secondPoint[1]);
                newPoint[2] = Math.abs(firstPoint[2] - secondPoint[2]);
                
                project._meter = vec3.length(newPoint);
                $("#measure-btn").find("div").html("Medir distancia");
                $("#measure-btn").css('opacity', '1');
                
                segundoPunto = false;
            
                setTimeout(function(){
                    ball_first.destroy();
                    ball_sec.destroy();
                }, 1500);
            }
        }
    } 
    
}   

function medirDistancia()
{
    if(project._meter === -1)
        return;
    
//    console.log("midiendo distancia");
//    alert("Selecciona dos puntos:");
    putCanvasMessage("Selecciona dos puntos:", 2500);
    
    var primerPunto     = true;
    var segundoPunto    = false;
    var ball_first      = null;
    var ball_sec        = null;
    
    context.onmousedown = function(e) 
    {
        
        if (primerPunto) {
        
            var result = vec3.create();
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var node = scene.testRay( ray, result, undefined, 0x1, true );
            
            if (node) {
                ball_first = new RD.SceneNode();
                ball_first.description = "config";
                ball_first.color = [0.3,0.8,0.1,1];
                ball_first.mesh = "sphere";
                ball_first.shader = "phong";
                ball_first.layers = 0x4;
                ball_first.flags.ignore_collisions = true;
                scene.root.addChild(ball_first);                
                ball_first.position = result;
                firstPoint = result;
            }
            
            primerPunto = false;
            segundoPunto = true;
            
        } else if (segundoPunto) {
            
            var result = vec3.create();
            var ray = camera.getRay( e.canvasx, e.canvasy );
            var node = scene.testRay( ray, result, undefined, 0x1, true );
            
            // Si ha habido colision, se crea un punto y se abre una ventana de texto para escribir la anotacion
            if (node) {
                ball_sec = new RD.SceneNode();
                ball_sec.description = "config";
                ball_sec.color = [0.3,0.8,0.1,1];
                ball_sec.mesh = "sphere";
                ball_sec.shader = "phong";
                ball_sec.layers = 0x4;
                ball_sec.flags.ignore_collisions = true;
                scene.root.addChild(ball_sec);                
                ball_sec.position = result;
                secondPoint = result;
                
                var newPoint = vec3.create();
                newPoint[0] = Math.abs(firstPoint[0] - secondPoint[0]);
                newPoint[1] = Math.abs(firstPoint[1] - secondPoint[1]);
                newPoint[2] = Math.abs(firstPoint[2] - secondPoint[2]);
                
                var distance = vec3.length(newPoint);
                var distance_in_meters = distance / project._meter;
//                console.log(distance_in_meters);
                
                segundoPunto = false;
                
                ball_first.destroy();
                ball_sec.destroy();
                
                project.insertMeasure(camera, firstPoint, secondPoint, distance_in_meters, true);
            }
        }
    } 
}

function medirSegmentos()
{
    if(project._meter === -1)
        return;
    
    putCanvasMessage("Selecciona los vértices de los segmentos haciendo click mientras pulsas 'S'. Recuérda que para el último tienes que mantener la 'F'!", 10000);
    
    var points              = [];
    var distance            = 0;
    var started_segments    = true;
    
    context.onmousedown = function(e) 
    {
        if((!keys[KEY_S] && !keys[KEY_F]) || !started_segments)
            return;
        
        var result = vec3.create();
        var ray = camera.getRay( e.canvasx, e.canvasy );
        var node = scene.testRay( ray, result, undefined, 0x1, true );

        if (node) {
            var ball = new RD.SceneNode();
            ball.description = "config";
            ball.color = [0.3,0.8,0.1,1];
            ball.mesh = "sphere";
            ball.shader = "phong";
            ball.layers = 0x4;
            ball.flags.ignore_collisions = true;
            scene.root.addChild(ball);                
            ball.position = result;
            points.push(result);
        }
        
         if(keys[KEY_F])
        {
            for(var i = 0; i < points.length - 1; ++i)
            {
                var newPoint = vec3.create();
                newPoint[0] = Math.abs(points[i][0] - points[i + 1][0]);
                newPoint[1] = Math.abs(points[i][1] - points[i + 1][1]);
                newPoint[2] = Math.abs(points[i][2] - points[i + 1][2]);

                var units = vec3.length(newPoint);
                var distance_in_meters = units / project._meter;
                distance += distance_in_meters;
            }
            
            started_segments = false;
//            console.log("done: " + distance);
            
            var vertices = [];
            
            for(var i = 0; i < points.length; ++i)
                {
                    vertices.push(points[i][0]);
                    vertices.push(points[i][1]);
                    vertices.push(points[i][2]);
                    
                        if(i)
                        {
                            vertices.push(points[i][0]);
                            vertices.push(points[i][1]);
                            vertices.push(points[i][2]);
                        }
                }
                
            
            var mesh = GL.Mesh.load({ vertices: vertices }); 
            renderer.meshes["line"] = mesh;
            var linea = new RD.SceneNode();
            linea.description = "config";
            linea.flags.ignore_collisions = true;
            linea.primitive = gl.LINES;
            linea.mesh = "line";
            linea.color = [0.3,0.8,0.1,1];
            linea.flags.depth_test = false;

//            console.log(linea);
            scene.root.addChild(linea);
            
            project.insertSegmentMeasure(points, distance, true);
            
            return;
        }
    } 
}

function viewMeasure(id)
{
    if(!first_measurement)
        destroySceneElements(scene.root.children, "config");
        
    first_measurement = false;
    
//    var console.log(id);
    var measure = project.getMeasure(id);
    var x1 = [measure.x1[0], measure.x1[1], measure.x1[2]];
    var x2 = [measure.x2[0], measure.x2[1], measure.x2[2]];
    var points = [x1, x2];
    
    for(var i = 0; i < points.length; ++i)
    {
        var ball = new RD.SceneNode();
        ball.color = [0.3,0.2,0.8,1];
        ball.mesh = "sphere";
        ball.scaling = 1.25;
        ball.layers = 0x4;
        ball.flags.ignore_collisions = true;
        ball.position = points[i];
        scene.root.addChild(ball);        
    }
    
    var vertices = x1.concat(x2);
    var mesh = GL.Mesh.load({ vertices: vertices }); 
    renderer.meshes["line"] = mesh;
    linea = new RD.SceneNode();
    linea.flags.ignore_collisions = true;
    linea.primitive = gl.LINES;
    linea.mesh = "line";
    linea.color = [0.3,0.2,0.8,1];
    linea.flags.depth_test = false;
    scene.root.addChild(linea);

    // change global camera
    camera.position = measure.camera_position;
    camera.target = measure.camera_target;
    camera.up = measure.camera_up;
    
}

function viewSegmentMeasure(id)
{
    if(!first_measurement)
        destroySceneElements(scene.root.children, "config");
        
    first_measurement = false;
    
//    var console.log(id);
    var measure = project.getSegmentMeasure(id);
    var points = measure.points;
//    console.log(points);
    
    for(var i = 0; i < points.length; ++i)
    {
        var ball = new RD.SceneNode();
        ball.color = [0.3,0.2,0.8,1];
        ball.mesh = "sphere";
        ball.description = "config";
        ball.scaling = 1.25;
        ball.layers = 0x4;
        ball.flags.ignore_collisions = true;
        ball.position = points[i];
        scene.root.addChild(ball);                      
        to_destroy.push(ball);
    }
    
        var vertices = [];
        for(var i = 0; i < points.length; ++i)
        {
            vertices.push(points[i][0]);
            vertices.push(points[i][1]);
            vertices.push(points[i][2]);

                if(i)
                {
                    vertices.push(points[i][0]);
                    vertices.push(points[i][1]);
                    vertices.push(points[i][2]);
                }
        }
                

        var mesh = GL.Mesh.load({ vertices: vertices }); 
        renderer.meshes["line"] = mesh;
        var linea = new RD.SceneNode();
        linea.description = "config";
        linea.flags.ignore_collisions = true;
        linea.primitive = gl.LINES;
        linea.mesh = "line";
        linea.color = [0.3,0.2,0.8,1];
        linea.flags.depth_test = false;

        scene.root.addChild(linea);
        to_destroy.push(linea);
}

/* ************************************************* */
// Rotation tools

var _dvalue = 0;

function modifyRotations(slider)
{
    var to_rotate;
    if(slider.value > _dvalue)
        to_rotate = 0.05 * Math.sign(slider.value);
    else
        to_rotate = - 0.05 * Math.sign(slider.value);
        
    var axis = null;

//    console.log(slider.id);
    
    if(slider.id === "s1")
            axis = RD.UP;
    if(slider.id === "s2")
            axis = RD.LEFT;
    if(slider.id === "s3")
            axis = RD.FRONT;

    obj.rotate(to_rotate, axis);
    _dvalue = slider.value;
    
}

function enableSetRotation()
{
    setting_rotation = !setting_rotation;
    // grid
    scene.root.children[1].flags.visible = setting_rotation;
    
    if(setting_rotation)
    {
        $("#cardinal-axis").fadeIn();
        $('.sliders').fadeIn();        
    }
    else
    {
        $("#cardinal-axis").fadeOut();
        $('.sliders').fadeOut();        
    }
        
}

/* ************************************************* */

var resize = function() 
{
    context.canvas.width   = placer.clientWidth;
    context.canvas.height  = placer.clientHeight;
    context.viewport(0, 0, context.canvas.width, context.canvas.height);

    if(camera){
        camera.perspective(camera.fov, placer.clientWidth / placer.clientHeight, camera.near, camera.far);
    }
    console.log('Resize');
}