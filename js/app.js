var project         = null;
var obj             = null;
var placer          = null;
var context         = null;
var scene           = null;
var renderer        = null;
var camera          = null;
var _dt             = 0.0;

var showing = {
    t1: false, // distances
    t2: false, // segments
    t3: false, // areas
}

var APP = {
    // rotation mode
    rotation: false,
    // visibility of anotations
    anot_visible: true,
    // qnt of rotation of the slider
    value: 0,
    // model is in orbit route
    orbiting: false,
    // result of collisions
    result: vec3.create(),

    // methods of APP
    parseJSON: function(json)
    {
        if(project === null){
            project = new Project( json, current_user, {no_construct: false} );
            project.config();
        } 

        /****************************************************************/
        /* render stuff*/

        var renderData = json.render;
        if(!renderData.mesh) {
            console.err("There is no mesh");
            return;
        }

        var root = "litefile/files/" + current_user + "/projects/";
        var meshURL = root + renderData.mesh;
        var textURL = root + renderData.texture;
        
        APP.init(meshURL, textURL);
    },

    init: function( meshURL, textureURL )
    {
        //create the rendering context
        context = GL.create({width: window.innerWidth, height: window.innerHeight, alpha: true});
        renderer = new RD.Renderer(context, {
            shaders_file: "data/shaders/shaders.glsl",
            autoload_assets: false
        });
        placer = document.getElementById("myCanvas");
        placer.appendChild(renderer.canvas); //attach

        // instanciate global scene
        scene = new RD.Scene();
        
        scene.root.getNodeByName = function(name){ 
            for(var n in scene.root.children) if(scene.root.children[n].name == name) return scene.root.children[n];
        }
        
        //create camera
        camera = new RD.Camera();
        camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
        camera.lookAt( [150,60,150],[0,0,0],[0,1,0] );
        camera.direction = [150,60,150];
        camera.previous = vec3.clone(camera._position);
        
        var wBinURL = meshURL.split(".")[0] + ".wbin";
        
        var on_load = function()
        {
            renderer.meshes[obj.mesh] = mesh;  
            $("#placeholder").css("background-image", "none");
            $("#placeholder").css("cursor", "default");
            $('#myCanvas').css({"opacity": 0, "visibility": "visible"}).animate({"opacity": 1.0}, 1500);
            putCanvasMessage("Puedes cancelar cualquier acción con la tecla ESC", 3500);
            if(!rotaciones.length)
                putCanvasMessage("No hay rotaciones por defecto: créalas en Herramientas", 2500, {type: "error"}); 
        }
        
        //create an obj in the scene
        obj = new RD.SceneNode();
        obj.name = "mesh 3d";
        obj.position = [0,0,0];
        obj.scale([5,5,5]);
        obj.mesh = wBinURL;
        
        $("#placeholder").css("cursor", "wait");
        
        mesh = GL.Mesh.fromURL( obj.mesh, function (response) {
            
            if(response === null){
                console.warn("no binary mesh found", obj.mesh);
                // load obj
                obj.mesh = meshURL;
                mesh = GL.Mesh.fromURL( obj.mesh, function (response) {
                    if(response === null){
                        console.warn("no mesh found", obj.mesh);
                    }
                    else// upload binary mesh for next use
                    {
                        var file = mesh.encode("wbin");
                        if(file)
                        {
                            var fileReader = new FileReader();
                            fileReader.onload = function() {
                                    var arrayBuffer = this.result;
                                    var fullpath = current_user + "/projects/" + project._id + "/mesh.wbin";
                                    session.uploadFile( fullpath, arrayBuffer, 0, function(){
                                        console.log("binary uploaded");
                                    }, function(err){
                                        console.error(err);
                                    });
                            };
                            fileReader.readAsArrayBuffer( new Blob([file]) );
                        }else
                            console.error("encoding error");
                        
                        on_load();
                    }
                }); //load from URL
                
            }
                
            else
                on_load();
        }); //load from URL
        
        // *************************************
        
        // one texture
        if (!isArray(textureURL)) {
            obj.texture = textureURL;
        }
        
        var obj_texture = renderer.loadTexture(obj.texture, renderer.default_texture_settings);
        
        // Hacer las rotaciones pendientes
        var rotaciones = project.getRotations();

        if(!rotaciones.length)
            console.error("No default rotations");
        else
        {
            for(var r in rotaciones)
                obj._rotation[r] = rotaciones[r];
            obj.updateMatrices();
        }

        //GRID
        var rot_grid = new SceneIndication();
        rot_grid = rot_grid.grid(5, {visible: false});
        
        //  skybox texture
        var cubeMaptexture = GL.Texture.cubemapFromURL("data/cubemaps/skybox.png",{is_cross: 1, minFilter: gl.LINEAR_MIPMAP_LINEAR });
        cubeMaptexture.bind(0);
        renderer.textures["skybox"] = cubeMaptexture;
        
        var skybox = new RD.SceneNode({
            mesh: "cube",
            texture: "skybox",
            shader: "basic"
        });
        
        skybox.name = "skybox";
        skybox.flags.depth_test = false;
        skybox.flags.flip_normals = true;
        skybox.render_priority = RD.PRIORITY_BACKGROUND;
        
//        obj.flags.depth_test = false;
//        obj.render_priority = RD.PRIORITY_ALPHA;
        
        // order is important
        scene.root.addChild( skybox );
        scene.root.addChild( obj );
        scene.root.addChild( rot_grid );

        var anotaciones = project.getAnnotations();
        if(!anotaciones.length)
            console.log("no anotations");

        for (var i = 0; i < anotaciones.length; i++) {

            var position = [ anotaciones[i].position[0], anotaciones[i].position[1], anotaciones[i].position[2]];
            var ind = new SceneIndication();
            ind = ind.ball(null, position, {id: anotaciones[i].id, color: [1,0,0,1]});
            ind.active = false;
            ind.time = 0.0;

            // set ball parent
            setParent(obj, ind);

            ind.update = function(dt)
            {
                this.time += dt;
                if(!this.active)
                    this.color = [1,0,0,1];
                else
                    this.color = [1, 0.3 + Math.sin(this.time*5), 0.3 + Math.sin(this.time*5), 1];
            }
        }

        //global settings
        var bg_color = vec4.fromValues(0.937, 0.937, 0.937, 1);

        //main render loop
        var last = now = getTime();
        requestAnimationFrame(animate);
        
        function animate() {
            requestAnimationFrame( animate );
            
            APP.lookAt(camera);
            
            last = now;
            now = getTime();
            var dt = (now - last) * 0.001;
            renderer.clear(bg_color);

            if(APP.orbiting)
                camera.orbit(0.1 * dt, RD.UP);
            
            if(keys[KEY_LEFT])
                camera.orbit_direction(-DEG2RAD, RD.UP);
            if(keys[KEY_RIGHT])
                camera.orbit_direction(DEG2RAD, RD.UP);
            
            //smoothing camera
            if(camera.smooth){
                vec3.scale(camera.position, camera.position, 0.05);
                vec3.scale(camera.previous, camera.previous, 0.95);
                vec3.add(camera.position, camera.position, camera.previous);
            }
            
            skybox.position = camera.position;
            renderer.render(scene, camera);
            scene.update(dt);
            
            //get old camera
            camera.previous = vec3.clone(camera._position);
        }

        APP.resize();
        context.animate(); //launch loop

        context.onupdate = function(dt) {
            _dt = dt;
        }

        context.onmousemove = function(e)
        {
            mouse = [e.canvasx, gl.canvas.height - e.canvasy];

            if (e.dragging && e.leftButton) {
                camera.orbit(-e.deltax * 0.5 * _dt, RD.UP);
                camera.orbit(-e.deltay * 0.5 * _dt, camera._right);
            }
            if (e.dragging && e.rightButton) {
                camera.moveLocal([-e.deltax * 0.5 * _dt, e.deltay * 0.5 * _dt, 0]);
            }
        }

        context.onmousewheel = function(e)
        {
            if(!e.wheel)
                return;

            camera.position = vec3.scale( camera.position, camera.position, e.wheel < 0 ? 1.05 : 0.95 );
        }

        context.onkeydown = function(e)
        {
            keys[e.keyCode] = true;      
        }
        
        context.onkeyup = function(e)
        {   
            keys[e.keyCode] = false;        

            if(e.keyCode === KEY_ENTER) // Enter
                APP.applyRotation(obj._rotation);

            if(e.keyCode === KEY_ESC)
                APP.disableAllFeatures();
            
//           if(e.keyCode === KEY_D)
//                download(renderer.meshes[obj.mesh], "wbin");
            
            if(e.keyCode === KEY_S)
                renderer.loadShaders("data/shaders/shaders.glsl");
        }

        context.captureMouse(true);
        context.captureKeys();
    },
    
    lookAt: function(camera)
    {
        if(!equals(camera.position, camera.direction) && camera.smooth)
            camera.position = camera.direction;
        else
            camera.smooth = false;
    },

    anotate: function(modoAnotacion)
    {
        if (modoAnotacion) {
            $("#desAnot").css('opacity', '1');
            $("#actAnot").css('opacity', '0.2');

            context.onmousedown = function(e) 
            {
                var ray = camera.getRay( e.canvasx, e.canvasy );
                var node = scene.testRay( ray, APP.result, undefined, 0x1, true );

                // Si ha habido colision, se crea un punto y se abre una ventana de texto para escribir la anotacion
                if (node)
                    $('#modalText').modal('show');
            }

        } else if (!modoAnotacion) {
            $("#desAnot").css('opacity', '0.2');
            $("#actAnot").css('opacity', '1');
            context.onmousedown = function(e) {}
        }

    },
    
    showElements: function (list, showing)
    {
        // obj.children
        for(var i = 0; i < list.length; i++)
            list[i].flags.visible = showing;
    },
    
    destroyElements: function (elements, description)
    {
        for(var i = 0; i < elements.length; ++i)
        {
            if(elements[i] === null)
                return;

            if(!description)    
                elements[i].destroy();
            else if(description == elements[i].description)
                elements[i].destroy();
        }
    },
    
    orbit: function(e)
    {
        APP.orbiting = !APP.orbiting;

        if(APP.orbiting)
            e.find("i").html("pause_circle_outline");
        else{
            e.find("i").html("play_circle_outline");
            e.removeClass("pressed");
        }
    },
    
    setCubeMap: function( url )
    {
        if(!url){
            scene.root.getNodeByName("skybox").shader = "basic"; 
            return;
        }
        scene.root.getNodeByName("skybox").shader = "skybox"; 
        var cubeMaptexture = GL.Texture.cubemapFromURL(url,{is_cross: 1, minFilter: gl.LINEAR_MIPMAP_LINEAR });
        cubeMaptexture.bind(0);
        renderer.textures["skybox"] = cubeMaptexture;  
    },

    setScale: function ()
    {
        if(project._meter !== -1)
        {
            putCanvasMessage("La configuración de la escala ya ha sido realizada en este proyecto. Si lo haces, perderás la medición anterior.", 8000, {type: "alert"});    
        }

        // clear first
        APP.disableAllFeatures();
        
        testDialog({scale: true, hidelower: true}); // open dialog
        putCanvasMessage("Selecciona dos puntos, la linea recta que los une corresponderá a la escala indicada (por defecto 1 metro). " +
                         "Esta acción utiliza autoguardado. Para cancelar pulsa ESC.", 8000);
        window.tmp = [];

        $("#add-dialog").click(function(){

            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");

            context.onmousedown = function(e) 
            {
                var result = vec3.create();
                var ray = camera.getRay( e.canvasx, e.canvasy );
                var node = scene.testRay( ray, result, undefined, 0x1, true );

                if (node) {
                    var ind = new SceneIndication();
                    ind = ind.ball(scene, result);
                    tmp.push(result);
                    if(tmp.length == 2)
                        $("#end-dialog").click();
                }
            }
        });

        $("#end-dialog").click(function(){

            var newPoint = vec3.create();
            var cur = tmp[0];
            var next = tmp[1];
            newPoint[0] = Math.abs(cur[0] - next[0]);
            newPoint[1] = Math.abs(cur[1] - next[1]);
            newPoint[2] = Math.abs(cur[2] - next[2]);

            var scale = parseFloat($("#scale-input").val()) || 1;
            var relation = vec3.length(newPoint) / scale;
            project.update_meter(relation);
            putCanvasMessage("Guardando...", 2000);
            $(".draggable").remove();
            $(".measures-btns").css('opacity', '1');
            
            context.onmousedown = function(e) {}
            $("#myCanvas").css("cursor", "default");

            setTimeout(function(){
                APP.destroyElements(scene.root.children, "config");
            }, 500);
        });
        
        $("#help-dialog").click(function(){
            if($(".dialog-option.help").css("display") == "none")
                $(".dialog-option.help").fadeIn();
            else
                $(".dialog-option.help").fadeOut();
        });
        
        $("#add-dialog").click();
    },
    
    setRotation: function ()
    {
        if(project._rotations.length)
            if(!confirm("Ya hay rotaciones por defecto en este proyecto. Si continuas se perderán todas las distancias medidas."))
                return;

        // clear first
        APP.disableAllFeatures();
        project._measures = [];
        project._segments = [];
        project._areas = [];
        $("#distances-table").find("tbody").empty();
        $("#segment-distances-table").find("tbody").empty();
        $("#areas-table").find("tbody").empty();

        APP.rotation = true;
        scene.root.getNodeByName("grid").flags.visible = true;

        putCanvasMessage("Usa los sliders o bien mantén pulsadas las teclas A, S y D mientras arrastras para rotar en cada eje.", 5000, {type: "help"});

        $("#cardinal-axis").fadeIn();
        $('.sliders').fadeIn();

        context.onmousemove = function(e)
        {
            mouse = [e.canvasx, gl.canvas.height - e.canvasy];
            if (e.dragging && e.leftButton)
                if(keys[KEY_A])
                    obj.rotate(-e.deltax * 0.1 * _dt, RD.UP);
                else if(keys[KEY_S])
                    obj.rotate(-e.deltax * 0.1 * _dt, RD.FRONT);
                else if(keys[KEY_D])
                    obj.rotate(-e.deltax * 0.1 * _dt, RD.LEFT);
                else
                    {
                        camera.orbit(-e.deltax * 0.1 * _dt, RD.UP,  camera._target);
                        camera.orbit(-e.deltay * 0.1 * _dt, camera._right, camera._target );
                    }
        }

    },
    
    applyRotation: function()
    {
        if(APP.rotation){
            APP.rotation = false;
            scene.root.getNodeByName("grid").flags.visible = false;
            revealDOMElements([$("#cardinal-axis"), $('.sliders')], false);
            
            project.setRotations(obj._rotation);
            project.save();
            putCanvasMessage("¡Guardado!", 2000);
            
             // upload project preview
            var canvas = gl.snapshot(0, 0, renderer.canvas.width, renderer.canvas.height);

            function on_complete( img_blob )
                {
                    var url = canvas.toDataURL();
                    var path = "../../litefile/files/" + current_user + "/projects/" + project._id + "/" + "preview.png";

                    $.ajax({
                        type: "POST",
                        url: 'server/php/uploadURL.php',
                        data: {
                            'url' : url,
                            'path' : path
                            },
                        success: on_success = function(){
                            console.log("done");
                        }
                    });
                }

            canvas.toBlob( on_complete, "image/png");
        }
    },
    
    calcDistance: function ()
    {
        if(project._meter == -1){
            putCanvasMessage("Primero configura la escala.", 3000, {type: "error"});
            return;
        }

        // clear first
        APP.disableAllFeatures();

        // open dialog
        testDialog();
        putCanvasMessage("Usa el panel de herramientas para medir", 2500);
        window.tmp = [];

        $("#add-dialog").click(function(){

            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");

            context.onmousedown = function(e) 
            {
                var result = vec3.create();
                var ray = camera.getRay( e.canvasx, e.canvasy );
                var node = scene.testRay( ray, result, undefined, 0x1, true );

                if (node) {
                    var ind = new SceneIndication();
                    ind = ind.ball(scene, result);
                    tmp.push(result);
                }

                if(tmp.length > 1)
                {
                    var vertices = [];
                    APP.destroyElements(scene.root.children, "config-tmp");

                    for(var i = 0; i < tmp.length; ++i)
                    {
                        vertices.push(tmp[i][0]);
                        vertices.push(tmp[i][1]);
                        vertices.push(tmp[i][2]);

                            if(i)
                            {
                                vertices.push(tmp[i][0]);
                                vertices.push(tmp[i][1]);
                                vertices.push(tmp[i][2]);
                            }
                    }

                    var mesh = GL.Mesh.load({ vertices: vertices }); 
                    renderer.meshes["line"] = mesh;
                    var linea = new RD.SceneNode();
                    linea.description = "config-tmp";
//                    linea.flags.ignore_collisions = true;
                    linea.primitive = gl.LINES;
                    linea.mesh = "line";
                    linea.color = [0.9,0.7,0.7,1];
                    linea.flags.depth_test = false;
                    linea.render_priority = RD.PRIORITY_HUD;
                    scene.root.addChild(linea);        
                }
            }
        });

        $("#end-dialog").click(function(){

            if(tmp.length < 2)
                return;

            var units = 0;

            for(var i = 0; i < tmp.length - 1; ++i)
            {
                var newPoint = vec3.create();
                var cur = tmp[i];
                var next = tmp[i+1];
                newPoint[0] = Math.abs(cur[0] - next[0]);
                newPoint[1] = Math.abs(cur[1] - next[1]);
                newPoint[2] = Math.abs(cur[2] - next[2]);

                units += vec3.length(newPoint);
            }

            var distance = units / project._meter;
            var vertices = [];

            for(var i = 0; i < tmp.length; ++i)
            {
                vertices.push(tmp[i][0]);
                vertices.push(tmp[i][1]);
                vertices.push(tmp[i][2]);

                    if(i)
                    {
                        vertices.push(tmp[i][0]);
                        vertices.push(tmp[i][1]);
                        vertices.push(tmp[i][2]);
                    }
            }

            context.onmousedown = function(e) {}
            $("#myCanvas").css("cursor", "default");

            var mesh = GL.Mesh.load({ vertices: vertices }); 
            renderer.meshes["line"] = mesh;
            var linea = new RD.SceneNode();
            linea.description = "config";
            linea.flags.ignore_collisions = true;
            linea.primitive = gl.LINES;
            linea.mesh = "line";
            linea.color = [0.3,0.8,0.1,1];
            linea.flags.depth_test = false;
            scene.root.addChild(linea);

            if(tmp.length == 2)
                project.insertMeasure(camera, tmp, distance, "nueva_dist", {display: true, push: true});
            else 
                project.insertSegmentMeasure(camera, tmp, distance, "nuevo_segs", {display: true, push: true});
            
            //clear all
            APP.disableAllFeatures();

        });
        
        // begin with an option selected
        $("#add-dialog").click();
    },

    calcArea: function (area_type)
    {
        if(project._meter == -1){
            putCanvasMessage("Primero configura la escala.", 3000, {type: "error"});
            return;
        }

        // clear first
        APP.disableAllFeatures();

        // open dialog
        testDialog();

        putCanvasMessage("Añade puntos sobre el plano de planta.", 3000);
        putCanvasMessage("El último punto debe coincidir con el primero.", 5000, {type: "alert"});

        window.tmp = [];
        var index = area_type === PLANTA ? 1 : 2;

        $("#add-dialog").click(function(){ 

            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");

            context.onmousedown = function(e) 
            {
                var result = vec3.create();
                // normal depending on the type of area
                var normal = area_type === PLANTA ? vec3.fromValues(0, 1, 0) : vec3.fromValues(1, 0, 0);
                var ray = camera.getRay( e.canvasx, e.canvasy );
                var node = null;

                if(tmp.length)
                {
                    result = camera.getRayPlaneCollision( e.canvasx, e.canvasy, tmp[0], normal);
                    node = true;
                }
                else
                    node = scene.testRay( ray, result, undefined, 0x1, true );

                if(!node)
                    return;

                // adjust to same point if first point is too close
                if(tmp.length > 1)
                {
                    var newPoint = vec3.create();
                    newPoint[0] = Math.abs(tmp[0][0] - result[0]);
                    newPoint[1] = Math.abs(tmp[0][1] - result[1]);
                    newPoint[2] = Math.abs(tmp[0][2] - result[2]);

                    var units = vec3.length(newPoint);
                    if(units < 1.5)
                        result = tmp[0];            
                }

                tmp.push(result);
                console.log(tmp);

                if(tmp.length == 1)
                {
                    console.log("creating plane");
                    
                    var plane = new RD.SceneNode({
                        mesh: "planeXZ",
                        position: tmp[0],
                        scaling: 500,
                        opacity: 0.35,
                        name: "area-plane"
                    });

                    plane.description = "config";
                    plane.blend_mode = RD.BLEND_ALPHA;
                    plane.flags.two_sided = true;

                    if(area_type === ALZADO)
                        plane.rotate(90 * DEG2RAD, RD.FRONT);
                    scene.root.addChild(plane);

                    var grid_mesh = GL.Mesh.grid({size:10});
                    renderer.meshes["grid"] = grid_mesh;

                    var grid = new RD.SceneNode({
                        mesh: "grid",
                        position: tmp[0],
                        color: [0.5, 0.5, 0.5]
                    });

                    grid.description = "config";
                    grid.primitive =gl.LINES;
                    grid.scale([50, 50, 50]);    

                    if(area_type === ALZADO)
                        grid.rotate(90 * DEG2RAD, RD.FRONT);
                    scene.root.addChild(grid);

                    var ind = new SceneIndication();
                    ind = ind.ball(scene, result, {depth_test: false});
                }

                // only when more than one to make the line between them
                else if(tmp.length > 1)
                {
                
                    console.log("creating rest");

                    var vertices = [];
                    APP.destroyElements(scene.root.children, "config-tmp");

                    var ind = new SceneIndication();
                    ind = ind.ball(scene, result, {depth_test: false});

                   /* for(var i = 0; i < tmp.length; ++i)
                    {
                        vertices.push(tmp[i][0],tmp[i][1],tmp[i][2]);
                        if(i)
                            vertices.push(tmp[i][0],tmp[i][1],tmp[i][2]);
                    }

                    var mesh = GL.Mesh.load({ vertices: vertices }); 
                    renderer.meshes["line"] = mesh;
                    var linea = new RD.SceneNode();
                    linea.description = "config-tmp";
                    linea.flags.ignore_collisions = true;
                    linea.primitive = gl.LINES;
                    linea.mesh = "line";
                    linea.color = [0.9,0.7,0.7,1];
                    linea.flags.depth_test = false;

                    scene.root.addChild(linea);    */   
                }
            }
        });

        $("#end-dialog").click(function(){

            if(tmp.length < 2)
                return;

            var vertices = [];

            for(var i = 0; i < tmp.length; ++i)
            {
                vertices.push(tmp[i][0],tmp[i][1],tmp[i][2]);
                    if(i)
                        vertices.push(tmp[i][0],tmp[i][1],tmp[i][2]);
            }

            APP.destroyElements(scene.root.children, "config-tmp");

            var mesh = GL.Mesh.load({ vertices: vertices }); 
            renderer.meshes["line"] = mesh;
            var linea = new RD.SceneNode();
            linea.description = "config";
            linea.flags.ignore_collisions = true;
            linea.primitive = gl.LINES;
            linea.mesh = "line";
            linea.color = [0.3,0.8,0.1,1];
            linea.flags.depth_test = false;
            scene.root.addChild(linea);

            var points2D = [];
            var p2D = null;
            var points = tmp;

            for(var i = 0; i < points.length; ++i)
            {
                // planta > index = 1
                // alzado > index = 2
                p2D = index == 1 ? vec2.fromValues(points[i][0], points[i][2]) : vec2.fromValues(points[i][1], points[i][2]);
                points2D.push(p2D);
            }

            var adds = 0;
            var subs = 0;

            for(var i = 0; i < points2D.length - 1; ++i)
            {
                var current = points2D[i];
                var next = points2D[i+1];

                adds += current[0] * next[1];
                subs += current[1] * next[0];
            }

            var area = Math.abs(0.5 * (adds - subs));
            area /= Math.pow(project._meter, 2);
            var msg = "AREA: " + area;
            putCanvasMessage(msg, 5000, {type: "response"});
            putCanvasMessage("Recuerda guardar...", 2000);

            // passing 3d points list
            project.insertArea(points, area, index, "nueva_area", {display: true, push: true});

            //clear all
            APP.disableAllFeatures();
        });
        
        // begin with an option selected
        $("#add-dialog").click();
    },
    
    renderMeasure: function(o)
    {
        o = o || {};

    	var id = o.id;
    	var type = o.type;
    	var msr = null;

        // clear first
        APP.destroyElements(scene.root.children, "config");// clear first
        
        //get from project
        if(type == 'm')
            msr = project.getMeasure(id);
	    else if(type == 's')
            msr = project.getSegmentMeasure(id);
	    else if(type == 'a')
            msr = project.getArea(id);
	    else
	        console.error("no measure to show");

        // points stuff
        var points = [];
        
        for(var i = 0; i < msr.points.length; ++i){
            var list = [];
            list.push(msr.points[i][0]);
            list.push(msr.points[i][1]);
            list.push(msr.points[i][2]);
            points.push(list);
            
            // ball render representation
            var ind = new SceneIndication();
            ind = ind.ball(scene, points[i], {depth_test: false, type: "view"});    
        }    
        
        // lines stuff
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
        linea.primitive = gl.LINES;
        linea.mesh = "line";
        linea.description = "config";
        linea.color = [0.258, 0.525, 0.956];
        linea.flags.depth_test = false;
        linea.render_priority = RD.PRIORITY_HUD;
        scene.root.addChild(linea);

        // change global camera
        // to look at with smooth efect
        if(msr.camera_position)
        {
            camera.direction = msr.camera_position;
            camera.smooth = true;    
        }
    },

    adjustSlider: function (slider)
    {
        var to_rotate;
        if(slider.value > APP.value)
            to_rotate = 0.05 * Math.sign(slider.value);
        else
            to_rotate = - 0.05 * Math.sign(slider.value);

        var axis = null;

        if(slider.id === "s1")
                axis = RD.UP;
        if(slider.id === "s2")
                axis = RD.LEFT;
        if(slider.id === "s3")
                axis = RD.FRONT;

        obj.rotate(to_rotate, axis);
        APP.value = slider.value;
    },

    disableAllFeatures: function (options)
    {
        options = options || {};
        context.onmousedown = function(e) {};
        
        APP.fadeAllTables(showing);
        scene.root.getNodeByName("grid").flags.visible = false;
        APP.rotation = false;
        revealDOMElements([$("#cardinal-axis"), $('.sliders'), $(".sub-btns")], false);
        APP.destroyElements(scene.root.children, "config");
        APP.destroyElements(scene.root.children, "config-tmp");
        $("#myCanvas").css("cursor", "default");
        $("#measure-opt-btn").find("i").html("add_circle_outline");
        $(".draggable").remove();
        $("#cont-msg").empty();

        //remove active classes
        $(".on-point").removeClass("on-point");
        $("#tools-tab .btn.tool-btn").removeClass("pressed");
        
        // clear capturing box
        $("#capturing").fadeOut().empty();
        
        if(options.no_msg)
            return;
        
        var msg = options.msg || "Hecho";
        var ms = options.ms || 1250;
        putCanvasMessage(msg, ms);
    },
    
    fadeAllTables: function (o)
    {
        // flags for visibility
        for(var i in o)
            o[i] = false;
        
        var list = [];
        
        list.push($('#distances-table'));
        list.push($('#measure-btn'));
        list.push($('#segment-distances-table'));
        list.push($('#measure-s-btn'));
        list.push($('#areas-table'));
        list.push($('#measure-opt-btn'));

        revealDOMElements(list, false, {e: ""});
    },
    
    goFullscreen: function()
    {
        renderer.gl.fullscreen()
    },
    
    resize: function() 
    {
        context.canvas.width   = placer.clientWidth;
        context.canvas.height  = placer.clientHeight;
        context.viewport(0, 0, context.canvas.width, context.canvas.height);

        if(camera)
            camera.perspective(camera.fov, placer.clientWidth / placer.clientHeight, camera.near, camera.far);

        console.log('Resize');
    }
}