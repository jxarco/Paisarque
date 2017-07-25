var project         = null;
var obj             = null;
var placer          = null;
var context         = null;
var scene           = null;
var renderer        = null;
var camera          = null;
var result          = vec3.create();
var firstPoint      = vec3.create();
var secondPoint     = vec3.create();

var _dt                 = 0.0;
var setting_rotation    = false;
var viz_anotations      = true;
var showing_dist_table  = false;
var subs                = 0;
var adds                = 0;

//
// Functions below this:
//

function parseJSON(json)
{
    if(project === null)
        project = new Project( json );
    
    project._user = current_project.split('/')[0];
    
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
    
    var makeVisible = function () {
        placer.style.visibility = "visible";
        // COMMENT BELOW TO DEBUG
        //alert("Remember to save the project when making any change!");
    };

    renderer.loadMesh(obj.mesh, makeVisible);
    renderer.loadTexture(obj.texture, renderer.default_texture_settings);
    
    // Hacer las rotaciones pendientes
    var rotaciones = project.getRotations();
    
    if(!rotaciones.length)
        alert("No default rotations. Go to Tools and set a default rotation matrix");
    else
    {
        obj._rotation[0] = rotaciones[0].r0;
        obj._rotation[1] = rotaciones[1].r1;
        obj._rotation[2] = rotaciones[2].r2;
        obj._rotation[3] = rotaciones[3].r3;
        
        obj.updateMatrices();
    }
    
    obj.scale([5,5,5]);
    pivot.addChild( obj );
    
    var grid = new RD.SceneNode();
    
    var grid_mesh = GL.Mesh.grid({size:5});
    renderer.meshes["grid"] = grid_mesh;
    grid.flags.visible = false;
    grid.name = "grid";
    grid.mesh = "grid";
    grid.primitive = gl.LINES;
    grid.color = [1, 1, 1, 1];
    grid.scale([50, 50, 50]);
    scene.root.addChild(grid);
        
    // se listan las anotaciones que hay en el fichero correspondiente que es el nombre del proyecto _anotaciones y se dibujan con un circulo rojo en la mesh
    
    var anotaciones = project.getAnnotations();
    
//    if(!anotaciones.length)
//        console.log("no anotations");
    
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
                this.color = [1, 0.3, Math.sin(this.time*5), 1];
        }
    }

    //global settings
    var bg_color = vec4.fromValues(0.3, 0.4, 0.5, 1);

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
    }
    
    resize();
    context.animate(); //launch loop
    
    context.onupdate = function(dt) {
        _dt = dt;
    }

    context.onmousemove = function(e)
    {
        /*if(e.dragging) {
            camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
            camera.rotate(e.deltax * 0.01, RD.UP);
            //pivot.rotate( e.deltax * 0.01, RD.UP );
        }*/
        
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

    context.onkeyup = function(e)
    {   
        if(!setting_rotation)
            return;
        
        if(e.keyCode === 13) // Enter
            {
                setting_rotation = false;
                scene.root.children[1].flags.visible = setting_rotation;
    
                if(setting_rotation)
                   $('.sliders').fadeIn();        
                else
                    $('.sliders').fadeOut();        
                
                project.setRotations(obj._rotation);
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
    alert("Selecciona dos puntos, la linea recta que los une corresponderá a un metro");
    
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
                console.log(project._meter);
                
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
    {
        alert("Configura primero la distancia relativa a un metro");
        return;
    }
    
    console.log("midiendo distancia");
    alert("Selecciona dos puntos:");
    
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
                ball_first.color = [0,0,1,1];
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
                ball_sec.color = [0,0,1,1];
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
                
                pushMedicion(distance_in_meters);
            }
            
            
        }
    } 
}   

function pushMedicion(distance)
{
    if(!distance)
        return;
    
    var table = $('#distances-table');
    var bodyTable = table.find('tbody');
    
    // add to measures in project
    var id = project.insertMeasure(firstPoint, secondPoint, distance);
    
    var row = "<tr id=" + id + " a class='pointer'>" + 
    "<td> x: " + Math.round(firstPoint[0] * 1000) / 1000 + "</br>y: " + Math.round(firstPoint[1] * 1000) / 1000 + "</br>z: " + Math.round(firstPoint[2] * 1000) / 1000 + "</td>" + 
    "<td> x: " + Math.round(secondPoint[0] * 1000) / 1000 + "</br>y: " + Math.round(secondPoint[1] * 1000) / 1000 + "</br>z: " + Math.round(secondPoint[2] * 1000) / 1000 + "</td>" + 
    "<td>" + Math.round(distance * 1000) / 1000 + "</td>" + 
    "</tr>";
    
    bodyTable.append(row);
    
    showing_dist_table = true;
    revealDOMElement(table, showing_dist_table);
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
       $('.sliders').fadeIn();        
    else
        $('.sliders').fadeOut();        
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

window.onresize = resize;