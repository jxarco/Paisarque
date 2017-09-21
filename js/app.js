var project         = null;
var obj             = null;
var placer          = null;
var context         = null;
var scene           = null;
var renderer        = null;
var camera          = null;
var tmp_camera      = null;
var _dt             = 0.0;

var showing = {
    t1: false, // distances
    t2: false, // segments
    t3: false, // areas
}

var APP = {
    // variables of APP
    rotation: false,
    value: 0,
    orbit: false,
    result: vec3.create(),

    // methods of APP
    parseJSON: function(json)
    {
        if(project === null){
            project = new Project( json, current_user, {no_construct: false} );
            project.check();
        } 

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

        APP.init(current_project, totalPathMesh, totalPathTexture);
    },

    init: function(current_project, meshURL, textureURL)
    {
        scene = new RD.Scene();

        //create the rendering context
        context = GL.create({width: window.innerWidth, height:window.innerHeight, alpha:true});
        renderer = new RD.Renderer(context, {shaders_file: "data/shaders.glsl"});
        placer = document.getElementById("myCanvas");
        placer.appendChild(renderer.canvas); //attach

        //disable autoload
        renderer.autoload_assets = false;
        
        //create camera
        camera = new RD.Camera();
        camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
        camera.lookAt( [120,60,120],[0,0,0],[0,1,0] );
        camera.direction = [120,60,120];
        camera.previous = vec3.clone(camera._position);

        var pivot = new RD.SceneNode();
        pivot.name = "3d pivot";
        //inner update
        /*pivot.update = function(dt) {
            this.rotate(dt * 0.1,RD.UP);
        }
        scene.root.addChild(pivot);*/

        //create an obj in the scene
        obj = new RD.SceneNode();
        obj.name = "mesh 3d";
        obj.position = [0,0,0];
        obj.mesh = meshURL;
        //obj.blend_mode = RD.BLEND_NONE;
        //obj.opacity = 1;
        
        // tenemos que pensar el caso en que haya mas de una textura
        if (!isArray(textureURL)) {
            obj.texture = textureURL;
        }

        // Hacer las rotaciones pendientes
        var rotaciones = project.getRotations();

        if(!rotaciones.length)
            console.log("No default rotations");
        else
        {
            obj._rotation[0] = rotaciones[0].r0;
            obj._rotation[1] = rotaciones[1].r1;
            obj._rotation[2] = rotaciones[2].r2;
            obj._rotation[3] = rotaciones[3].r3;

            obj.updateMatrices();
        }

        var makeVisible = function () {
            $("#placeholder").css("background-image", "none");
            $('#myCanvas').css({"opacity": 0, "visibility": "visible"}).animate({"opacity": 1.0}, 1000);
            putCanvasMessage("Recuerda: guarda el proyecto al realizar cambios!", 3000);
            putCanvasMessage("Puedes cancelar cualquier acción con la tecla ESC", 3000);
            if(!rotaciones.length)
                putCanvasMessage("No hay rotaciones por defecto: créalas en Herramientas", 2500, {type: "error"}); 
        };

        renderer.loadMesh(obj.mesh, makeVisible);
        renderer.loadTexture(obj.texture, renderer.default_texture_settings);

        obj.scale([5,5,5]);

        //GRID
        var ind = new SceneIndication();
        ind.grid(5, {visible: false});
        
        //  skybox texture
        var cubeMaptexture = GL.Texture.cubemapFromURL("data/skybox.png",{is_cross: 1, minFilter: gl.LINEAR_MIPMAP_LINEAR });
        cubeMaptexture.bind(0);
        renderer.textures["skybox"] = cubeMaptexture;
        
        var skybox = new RD.SceneNode({
            name: "skybox",
            mesh: "cube",
            texture: "skybox",
            shader: "skybox"
        });
        
        skybox.flags.depth_test = false;
        skybox.flags.flip_normals = true;
        
        scene.root.addChild(skybox);
        scene.root.addChild( obj );

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
        var bg_color = vec4.fromValues(0.823, 0.823, 0.823, 1);

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

            if(APP.orbit)
                camera.orbit(0.1 * dt, RD.UP);
            
            //smoothing camera
            if(camera.smooth){
                vec3.scale(camera.position, camera.position, 0.1);
                vec3.scale(camera.previous, camera.previous, 0.9);
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
                camera.orbit(-e.deltax * 0.1 * _dt, RD.UP);
                camera.orbit(-e.deltay * 0.1 * _dt, camera._right);
            }
            if (e.dragging && e.rightButton) {
                camera.moveLocal([-e.deltax * 0.5 * _dt, e.deltay * 0.5 * _dt, 0]);
            }
        }

        context.onmousewheel = function(e)
        {
            if(!e.wheel)
                return;

            camera.position = vec3.scale( camera.position, camera.position, e.wheel < 0 ? 1.1 : 0.9 );
        }

        context.onkeydown = function(e)
        {
            keys[e.keyCode] = true;      
            
            if(e.keyCode == KEY_A){
                renderer.loadShaders("data/shaders.glsl");
            }
        }
        
        context.onkey = function(e)
        {
            if(e.keyCode == KEY_S){
                camera.position = [120, 60, 120];
            }
        }

        context.onkeyup = function(e)
        {   
            keys[e.keyCode] = false;        

            if(e.keyCode === 13) // Enter
            {
                if(APP.rotation){
                    APP.rotation = false;
                    scene.root.children[1].flags.visible = APP.rotation;

                    if(APP.rotation)
                        revealDOMElements([$("#cardinal-axis"), $('.sliders')], true);
                    else
                        revealDOMElements([$("#cardinal-axis"), $('.sliders')], false);

                    project.setRotations(obj._rotation);
                    putCanvasMessage("Recuerda guardar...", 2000);
                }
            }

            if(e.keyCode === 27) // ESC
                APP.disableAllFeatures();
        }

        context.captureMouse(true);
        context.captureKeys();
    },
    
    lookAt: function(camera)
    {
        if(keys[KEY_S]){
            camera.position = camera.direction;
        }

        if(!equals(camera.position, camera.direction) && camera.smooth){
            camera.position = camera.direction;
        }else{
            camera.smooth = false;
        }
    },

    anotar: function(modoAnotacion)
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

    setScale: function ()
    {
        if(project._meter !== -1)
        {
            putCanvasMessage("La configuración de la escala ya ha sido realizada en este proyecto. Si lo haces, perderás la medición anterior.", 8000, {type: "alert"});    
        }

        // clear first
        APP.destroyElements(scene.root.children, "config");
        APP.fadeAllTables(showing);
        $(".draggable").remove();
        
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

        APP.rotation = !APP.rotation;
        scene.root.children[0].flags.visible = APP.rotation; // grid

        if(APP.rotation)
        {
            putCanvasMessage("Usa los sliders o bien mantén pulsadas las teclas A, S y D mientras arrastras para rotar en cada eje. (¡Guarda al acabar!)", 5000, {type: "help"});

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
        }
        else
        {
            $("#cardinal-axis").fadeOut();
            $('.sliders').fadeOut();        

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
        }

    },
    
    calcDistance: function ()
    {
        if(project._meter === -1)
            return;

        // clear first
        APP.destroyElements(scene.root.children, "config");
        $(".draggable").remove();

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
                    linea.flags.ignore_collisions = true;
                    linea.primitive = gl.LINES;
                    linea.mesh = "line";
                    linea.color = [0.9,0.7,0.7,1];
                    linea.flags.depth_test = false;
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

            APP.destroyElements(scene.root.children, "config-tmp");
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

            // remove dialog
            $(".draggable").remove();
            putCanvasMessage("Recuerda guardar...", 2000);
            
            if(tmp.length == 2)
                project.insertMeasure(camera, tmp, distance, {display: true, push: true});
            else 
                project.insertSegmentMeasure(tmp, distance, {display: true, push: true});

        });
        
        // begin with an option selected
        $("#add-dialog").click();
    },

    calcArea: function (vista)
    {
        if(project._meter == -1){
            putCanvasMessage("Primero configura la escala.", 3000, {type: "error"});
            return;
        }

         // clear first
        APP.destroyElements(scene.root.children, "config");
        $(".draggable").remove();

        // open dialog
        testDialog();

        putCanvasMessage("Añade puntos sobre el plano de planta.", 3000);
        putCanvasMessage("El último punto debe coincidir con el primero.", 5000, {type: "alert"});
        $(".sub-btns").hide();
        $("#measure-opt-btn").find("i").html("add_circle_outline");

        window.tmp = [];
        var index = vista === PLANTA ? 1 : 2;

        $("#add-dialog").click(function(){ 

            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");

            context.onmousedown = function(e) 
            {
                var result = vec3.create();
                // normal depending on the type of area
                var normal = vista === PLANTA ? vec3.fromValues(0, 1, 0) : vec3.fromValues(1, 0, 0);
                var ray = camera.getRay( e.canvasx, e.canvasy );
                var node = null;

                if(tmp.length){
                    result = camera.getRayPlaneCollision( e.canvasx, e.canvasy, tmp[0], normal);
                    node = true;
                }
                else
                    node = scene.testRay( ray, result, undefined, 0x1, true );

                if (node) {

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

                    if(tmp.length == 1)
                    {
                        var plane = new RD.SceneNode({
                            mesh: "planeXZ",
                            position: tmp[0],
                            scaling: 500,
                            blend_mode: RD.BLEND_ALPHA,
                            opacity: 0.35,
                            name: "area-plane"
                        });
                        
                        plane.description = "config";
                        plane.flags.two_sided = true;
                        
                        if(vista === ALZADO)
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
                        
                        if(vista === ALZADO)
                            grid.rotate(90 * DEG2RAD, RD.FRONT);
                        scene.root.addChild(grid);

                        // set opacity to the main object
                        // idea: plane over obj
//                        obj.blend_mode = 1;
//                        obj.opacity = 0.75;
                        
                        var ind = new SceneIndication();
                        ind = ind.ball(scene, result, {depth_test: false});
                    }
                }

                if(tmp.length > 1)
                {
                    var vertices = [];
                    APP.destroyElements(scene.root.children, "config-tmp");
                    
                    var ind = new SceneIndication();
                    ind = ind.ball(scene, result, {depth_test: false});

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
                    linea.flags.ignore_collisions = true;
                    linea.primitive = gl.LINES;
                    linea.mesh = "line";
                    linea.color = [0.9,0.7,0.7,1];
                    linea.flags.depth_test = false;

                    scene.root.addChild(linea);        
                }
            }
        });

        $("#end-dialog").click(function(){

            if(tmp.length < 2)
                return;

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
            project.insertArea(points, area, index, "+++++", {display: true, push: true});

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
            msr = project.getMeasure(id)
	    else if(type == 's')
            msr = project.getSegmentMeasure(id)
	    else if(type == 'a')
            msr = project.getArea(id)
	    else
	        console.error("no measure to show");
        
        var points = [];
        
        for(var i = 0; i < msr.points.length; ++i){
            var list = [];
            list.push(msr.points[i][0]);
            list.push(msr.points[i][1]);
            list.push(msr.points[i][2]);
            points.push(list);
            
            // render representation
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
        linea.flags.ignore_collisions = true;
        linea.primitive = gl.LINES;
        linea.mesh = "line";
        linea.description = "config";
        linea.color = [0.258, 0.525, 0.956];
        linea.flags.depth_test = false;
        scene.root.addChild(linea);

        // change global camera
        // to look at with smooth efect
        camera.direction = msr.camera_position || camera.direction;
        camera.smooth = true;
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

    disableAllFeatures: function ()
    {
        context.onmousedown = function(e) {};
        APP.rotation = false;
        scene.root.children[0].flags.visible = false;

        revealDOMElements([$("#cardinal-axis"), $('.sliders')], false);
        APP.destroyElements(scene.root.children, "config");
        APP.destroyElements(scene.root.children, "config-tmp");
        $("#myCanvas").css("cursor", "default");
        $("#measure-opt-btn").find("i").html("add_circle_outline");
        $(".sub-btns").hide();
        $(".draggable").remove();
        $("#cont-msg").empty();

        //on-point class
        $(".on-point").removeClass("on-point");
        
        putCanvasMessage("Hecho!", 1000);
    },
    
    fadeAllTables: function (o)
    {
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