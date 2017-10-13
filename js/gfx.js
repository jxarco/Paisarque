var GFX = {
    
    init: function( meshURL, textureURL )
    {
        //create the rendering context
        this.context = GL.create({width: window.innerWidth, height: window.innerHeight, alpha: true});
        this.renderer = new RD.Renderer(context, {
            shaders_file: "data/shaders/shaders.glsl",
            autoload_assets: false
        });
        this.placer = document.getElementById("myCanvas");
        this.placer.appendChild(renderer.canvas); //attach

        // instanciate global scene
        this.scene = new RD.Scene();
        this.scene.root.getNodeByName = function(name){ 
            for(var n in scene.root.children) if(scene.root.children[n].name == name) return scene.root.children[n];
        }
        
        //create camera
        this.camera = new RD.Camera();
        this.camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
        this.camera.lookAt( [150,60,150],[0,0,0],[0,1,0] );
        this.camera.direction = [150,60,150];
        this.camera.previous = vec3.clone(camera._position);
        
        var wBinURL = meshURL.split(".")[0] + ".wbin";
        
        var on_load = function()
        {
            this.renderer.meshes[obj.mesh] = mesh;  
            $("#placeholder").css("background-image", "none");
            $("#placeholder").css("cursor", "default");
            $('#myCanvas').css({"opacity": 0, "visibility": "visible"}).animate({"opacity": 1.0}, 1500);
            putCanvasMessage("Puedes cancelar cualquier acción con la tecla ESC", 3500);
            if(rotaciones && !rotaciones.length)
                putCanvasMessage("No hay rotaciones por defecto: créalas en Herramientas", 2500, {type: "error"}); 
        }
        
        //create an obj in the scene
        var obj = new RD.SceneNode();
        obj.name = "mesh 3d";
        obj.position = [0,0,0];
        obj.scale([5,5,5]);
        obj.mesh = wBinURL;
        
        this.obj = obj;
        
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
            
            if(e.keyCode === KEY_S)
                renderer.loadShaders("data/shaders/shaders.glsl");
        }

        context.captureMouse(true);
        context.captureKeys();
    }
}