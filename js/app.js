var placer      = null;
var context     = null;
var scene       = null;
var renderer    = null;
var camera      = null;
var result      = vec3.create();
var firstPoint  = vec3.create();
var secondPoint = vec3.create();
var meter       = null;

var _dt = 0.0;

var default_project = "pit";
var current_project = getQueryVariable("r") || default_project;

// Una lista de anotaciones vacia, cada anotacion consistira en:
// - Numero 
// - Posición
// - Texto
// - Propiedades de la camara en ese momento
var anotaciones = [];
var scaling_factor = 1;
// Ver anotaciones en la mesh:
var viz_anotations  = true;

// show distances table
var showing_dt = false;

function parseJSON(json) {
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
    
    init(current_project, totalPathMesh, totalPathTexture, renderData.rotaciones);
}


function parseJSONANOT(json){ 
    
    for (var i = 0; i < json.length; i++) {
        anotaciones.push(json[i]);
    }
    
    if(!anotaciones.length)
        alert("json has 0 anotations");
}

function init(current_project, meshURL, textureURL, rotaciones)
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
    var obj = new RD.SceneNode();
    obj.position = [0,0,0];
    obj.color = [1,1,1,1];
    //obj.shader = "textured_phong";
    obj.mesh = meshURL;
    // tenemos que pensar el caso en que haya mas de una textura
    if (!isArray(textureURL)) {
        obj.texture = textureURL;
    }
    
    var makeVisible = function () {
        
        placer.style.visibility="visible";
    };

    renderer.loadMesh(obj.mesh, makeVisible);
    renderer.loadTexture(obj.texture, renderer.default_texture_settings);
    
    // Hacer las rotaciones que hay en el JSON
    for (var i = 0; i < rotaciones.length; i++) {
        var grados = rotaciones[i].grados;
        var x = rotaciones[i].x;
        var y = rotaciones[i].y;
        var z = rotaciones[i].z;
        
        obj.rotate(grados,[x,y,z]);
    }
    
    obj.scale([5,5,5]);
    pivot.addChild( obj );
        
    // se listan las anotaciones que hay en el fichero correspondiente que es el nombre del proyecto _anotaciones y se dibujan con un circulo rojo en la mesh
    
    if(!anotaciones.length)
        alert("no anotations");
    
    for (var i = 0; i < anotaciones.length; i++) {
        
        var ball = new RD.SceneNode();
        ball.id = i + 1;
        ball.color = [1,0,0,1];
        ball.size = scaling_factor;
        ball.scaling = ball.size;
        ball.mesh = "sphere";
        ball.shader = "phong";
        //var cam_normalized = vec3.create();
        //vec3.normalize(cam_normalized, camera.position);
        //ball._uniforms['u_light_vector'] = cam_normalized;
        ball.layers = 0x4;
        ball.flags.ignore_collisions = true;
        ball.active = false;
        ball.time = 0.0;
        
        scene.root.addChild(ball);

        ball.update = function(dt)
        {
            this.time += dt;
            
            if(!this.active)
                this.color = [1,0,0,1];
            else
                this.color = [1, 0.3, Math.sin(this.time*5), 1];
        }
         
        var positionResult = [anotaciones[i]["posicion"][0], anotaciones[i]["posicion"][1], anotaciones[i]["posicion"][2]];
        
        var anotPosCamera = [anotaciones[i]["position_camera"][0], anotaciones[i]["position_camera"][1], anotaciones[i]["position_camera"][2]];
        var anotTargetCamera = [anotaciones[i]["target_camera"][0], anotaciones[i]["target_camera"][1], anotaciones[i]["target_camera"][2]];
        var anotUpCamera = [anotaciones[i]["up_camera"][0], anotaciones[i]["up_camera"][1], anotaciones[i]["up_camera"][2]];
        
        ball.position = positionResult;
        
        var totalString = '<tr a onclick="lookAtAnot( camera, [' + anotPosCamera + '] , [' +  anotTargetCamera + "] , [" + anotUpCamera + ' ], ' + ball.id + ' )"><td>' + anotaciones[i]["numero"] + "</td>" + "<td>" + anotaciones[i]["texto"] + "</td></tr>";
                
        $("#anotacion_tabla").append(totalString);
    }

    //global settings
    var bg_color = vec4.fromValues(0.2,0.3,0.4,1);

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
    run();
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

    
    context.captureMouse(true);
    
}

function run(){
    resize();
}

var anotar = function(modoAnotacion) {
    
    if (modoAnotacion) {
        console.log("Modo anotación activado")
        $("#actAnot").hide();
        $("#desAnot").show();
        
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
        $("#actAnot").show();
        $("#desAnot").hide();
        context.onmousedown = function(e) {}
    }

}

$("#saveTextButton").click(function (e) {
                    
    var ball = new RD.SceneNode();
    var totalString = "";
    var numeroA = anotaciones.length + 1;

    ball.color = [1,0,0,1];
    ball.id = numeroA;
    ball.size = scaling_factor;
    ball.scaling = ball.size;
    ball.shader = "phong";
    ball.mesh = "sphere";
    ball.layers = 0x4;
    ball.flags.ignore_collisions = true;
    ball.active = false;
    ball.time = 0.0;
    scene.root.addChild(ball);

    ball.update = function(dt)
    {
        this.time += dt;
            
        if(!this.active)
            this.color = [1,0,0,1];
        else
            this.color = [1, 0.3, Math.sin(this.time*5), 1];
    }

    ball.position = result;

    //$(this)
    // se coge el texto correspondiente
    var text = document.getElementById("message-text").value;
    var numeroA = anotaciones.length + 1;
    
    // vaciar texto
    document.getElementById("message-text").value = "";

    // se crea una anotacion con todos los parametros
    var anotacion = {numero:numeroA, position_camera: [camera.position[0], camera.position[1], camera.position[2]], target_camera: [camera.target[0], camera.target[1], camera.target[2]], up_camera: [camera.up[0], camera.up[1], camera.up[2]], texto:text, posicion:result};
    // se anade a la lista de anotaciones de la aplicacion
    anotaciones.push(anotacion); 

    // se pone en el documento html y ademas que cuando se apreta a la anotacion se cambia a la camara con la que estaba
    totalString = '<tr a onclick="lookAtAnot( camera, [' + camera.position  + "] , [" + camera.target + "],[" + camera.up + '], ' + numeroA + ')">'+ "<td>" + numeroA + "</td>" + "<td>" + text + "</td>"
    +"</tr>";
    $("#anotacion_tabla").append(totalString);

    //$(this).off('hidden.bs.modal');
});


// Enter para enviar la anotación 
$('#message-text').keyup(function(e) {
    e.preventDefault();
    if(e.keyCode == 13)
        $("#saveTextButton").click();
});

/* ************************************************* */

// Tab for tools

$("#viz_on").click(function(){
    
    viz_anotations = !viz_anotations;
    changeVizAnotInCanvas(viz_anotations);
    
    var extra = viz_anotations === false ? "_off" : "";
    var tooltip = viz_anotations === false ? "Show anotations" : "Hide anotations";
    $(this).html( "<div class='info_hover_box'>" + tooltip + "</div><i class='material-icons'>visibility" + extra + "</i>" );
    
    //console.log( $(this).html() ); 
});

function changeVizAnotInCanvas(viz)
{
    for(var i = 0; i < scene.root.children.length; i++)
        {
            var current = scene.root.children[i];
            
            if(current.id > 0 && !viz){
                current.flags.visible = false;
                //console.log("deleting viz to ball");
            }
                
            else
                current.flags.visible = true;
        }
}

function changeSizeAnotInCanvas(op_type)
{
    // lets say op_type = 1 to add
    // and 0 to substract
    var ADD = true;
    var SUBS = false;
    var last_node = null;
    
    for(var i = 0; i < scene.root.children.length; i++)
    {
        var current = scene.root.children[i];

        if(current.id > 0 && op_type === ADD)
            {
                current.size = scaling_factor * 1.1;
                current.scaling = current.size;
            }
                
        else if(current.id > 0 && op_type === SUBS)
            {
                current.size = scaling_factor * 0.9;
                current.scaling = current.size;
            }
        
        last_node = current;
    }
    
    scaling_factor = last_node.size;
}

var medirMetro = function () {
    
    console.log("midiendo cuanto es un metro");
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
                
                // Esto sera lo que correspondera a un metro en la aplicacion
//                console.log(newPoint);
                
                // tengo que acabar la parte de las mediciones pero aun no tengo del todo claro, si quereis lo hablamos por correo para ver que pensais?
                meter = vec3.length(newPoint);
                console.log(meter);
                
                segundoPunto = false;
            
                setTimeout(function(){
                    ball_first.destroy();
                    ball_sec.destroy();
                }, 3000);
            }
        }
    } 
    
}   

var medirDistancia = function ()
{
    if(meter === null)
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
                var distance_in_meters = distance / meter;
//                console.log(distance_in_meters);
                
                segundoPunto = false;
                
                ball_first.destroy();
                ball_sec.destroy();
                
                pushMedicion(distance_in_meters);
            }
            
            
        }
    } 
}   

function meterByDefault(){
    meter = 100;
    pushMedicion(100);
}

function revealDistancesTable()
{
    var table = $('#distances-table');
    
    if(showing_dt)
        table.fadeIn();
    else
        table.fadeOut();
}

$("#show_dt").click(function(){
    
    console.log("showing/hiding distances table");
    showing_dt = !showing_dt;
    
    revealDistancesTable();
});

function pushMedicion(distance)
{
    if(!distance)
        return;
    
    var table = $('#distances-table');
    var bodyTable = table.find('tbody');
    
    var row = "<tr a class='pointer'>" + 
    "<td> x: " + Math.round(firstPoint[0] * 1000) / 1000 + "</br>y: " + Math.round(firstPoint[1] * 1000) / 1000 + "</br>z: " + Math.round(firstPoint[2] * 1000) / 1000 + "</td>" + 
    "<td> x: " + Math.round(secondPoint[0] * 1000) / 1000 + "</br>y: " + Math.round(secondPoint[1] * 1000) / 1000 + "</br>z: " + Math.round(secondPoint[2] * 1000) / 1000 + "</td>" + 
    "<td>" + Math.round(distance * 1000) / 1000 + "</td>" + 
    "</tr>";
    
    bodyTable.append(row);
    
    console.log("showing/hiding distances table");
    showing_dt = true;
    
    revealDistancesTable();
}

/* ************************************************* */

var borrarAnotacion = function() {
    
    // TO DO
}

var borrarAnotaciones = function() {
    
    anotaciones = [];
    $('#anotacion_tabla').empty();
    
    console.log(scene.root.children);

    // Eliminamos todos los hijos de la escena menos el primero
    // el primero sera la mesh y los otros los puntos que queremos quitar
    scene.root.children.splice(1,scene.root.children.length)
    
    console.log(scene.root.children);


    var fileNameString = "data/"+current_project+'_anotacion.json';


    $.ajax({type: "GET",
            dataType : 'json',
            url: 'save_anotation.php',
            data: { data: "", file_name:fileNameString},
            success: function(data){ 
                console.log("TABLA ACTUALIZADA");
            }                    
    });
}


var saveAnotations = function() {
    
    var fileNameString = "data/"+current_project+'_anotacion.json';
    
    $.ajax({type: "GET",
            dataType : 'json',
            url: 'save_anotation.php',
            data: { data: JSON.stringify(anotaciones), file_name:fileNameString},
            success: function(){ 
                console.log("TABLA ACTUALIZADA");
            }                    
    });
}

var resize = function(){
    context.canvas.width   = placer.clientWidth;
    context.canvas.height  = placer.clientHeight;
    context.viewport(0, 0, context.canvas.width, context.canvas.height);

    if(camera){
        camera.perspective(camera.fov, placer.clientWidth / placer.clientHeight, camera.near, camera.far);
    }
    console.log('Resize');
}

window.onresize = resize;