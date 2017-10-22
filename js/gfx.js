var GFX = {
    /*
    * init graphic stuff
    */
    init: function( meshURL, textureURL )
    {
        var that = this;
        
        //create the rendering context
        this.context = GL.create({width: window.innerWidth, height: window.innerHeight, alpha: true});
        this.renderer = new RD.Renderer(this.context, {
            shaders_file: "data/shaders/shaders.glsl",
            autoload_assets: false
        });
        this.placer = document.getElementById("myCanvas");
        this.placer.appendChild(this.renderer.canvas); //attach

        // instanciate global scene
        this.scene = new RD.Scene();
        this.scene.root.getNodeByName = function(name){ 
            for(var n in that.scene.root.children) if(that.scene.root.children[n].name == name) return that.scene.root.children[n];
        }
        this.scene.root.getNodesByName = function(name){ 
            var nodes = [];
            for(var n in that.scene.root.children) if(that.scene.root.children[n].name == name) nodes.push(that.scene.root.children[n]);
            return nodes;
        }
        
        //create camera
        this.camera = new RD.Camera();
        this.camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
        this.camera.lookAt( [150,60,150],[0,0,0],[0,1,0] );
        this.camera.direction = [150,60,150];
        this.camera.previous = vec3.clone(this.camera._position);
        
        var wBinURL = meshURL.split(".")[0] + ".wbin";
        
        //create an obj in the scene
        var model = new RD.SceneNode();
        model.name = "mesh 3d";
        model.position = [0,0,0];
        model.scale([5,5,5]);
        model.mesh = wBinURL;
        
        this.model = model;
        
        var on_load = function()
        {
            that.renderer.meshes[that.model.mesh] = mesh;  
            $("#placeholder").css("background-image", "none");
            $("#placeholder").css("cursor", "default");
            $('#myCanvas').css({"opacity": 0, "visibility": "visible"}).animate({"opacity": 1.0}, 1500);

            if(rotaciones && !rotaciones.length)
            {
                var msg = {
                    es: "No hay rotaciones por defecto",
                    cat: "No hay rotacions per defecte",
                    en: "No rotations by default"
                }
                putCanvasMessage(msg, 2500, {type: "error"}); 
            }
        }
        
        $("#placeholder").css("cursor", "wait");
        
        mesh = GL.Mesh.fromURL( that.model.mesh, function (response) {
            
            if(response === null){
                console.warn("no binary mesh found", that.model.mesh);
                // load obj
                that.model.mesh = meshURL;
                mesh = GL.Mesh.fromURL( that.model.mesh, function (response) {
                    if(response === null){
                        console.warn("no mesh found", that.model.mesh);
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
        });
        
        // *************************************
        
        // one texture
        if (!isArray(textureURL)) {
            that.model.texture = textureURL;
        }
        
        var obj_texture = this.renderer.loadTexture(that.model.texture, that.renderer.default_texture_settings);
        
        // Hacer las rotaciones pendientes
        var rotaciones = project.getRotations();
        if(rotaciones.length){
            for(var r in rotaciones)
                that.model._rotation[r] = rotaciones[r];
            that.model.updateMatrices();
        }

        //  skybox texture
        this.renderer.default_cubemaptexture_settings = this.renderer.default_texture_settings;
        this.renderer.default_cubemaptexture_settings.is_cross = 1;
        var cubeMaptexture = GL.Texture.cubemapFromURL("data/cubemaps/skybox.png", this.renderer.default_cubemaptexture_settings);
        this.renderer.textures["skybox"] = cubeMaptexture;
        
        var skybox = new RD.SceneNode({
            mesh: "cube",
            texture: "skybox",
            shader: "basic"
        });
        
        skybox.name = "skybox";
        skybox.flags.depth_test = false;
        skybox.flags.flip_normals = true;
        skybox.render_priority = RD.PRIORITY_BACKGROUND;
        
        this.skybox = skybox;
        
        // order is important
        this.scene.root.addChild( this.skybox );
        this.scene.root.addChild( this.model );

        var anotaciones = project.getAnnotations();
        for (var i = 0, anot; anot = anotaciones[i]; i++)
        {
            var position = [ anot.position[0], anot.position[1], anot.position[2]];
            
            var ind = new SceneIndication({
                position: position,
                id: anotaciones[i].id,
                active: false,
                time: 0.0,
                onupdate: "blink"
            });

            // set ball parent
            setParent(that.model, ind.node);
        }

        //global settings
        var bg_color = vec4.fromValues(0.937, 0.937, 0.937, 1);

        //main render loop
        var last = now = getTime();
        requestAnimationFrame(animate);
        
        function animate() {
            requestAnimationFrame( animate );
            
            APP.lookAt(that.camera);
            
            last = now;
            now = getTime();
            var dt = (now - last) * 0.001;
            that.renderer.clear(bg_color);

            // orbit depending on orbit speed
            if(that.orbit_speed)
                that.camera.orbit(that.orbit_speed * dt, RD.UP);
            
            //smoothing camera
            if(that.camera.smooth){
                vec3.scale(that.camera.position, that.camera.position, 0.05);
                vec3.scale(that.camera.previous, that.camera.previous, 0.95);
                vec3.add(that.camera.position, that.camera.position, that.camera.previous);
            }
            
            that.skybox.position = that.camera.position;
            that.renderer.render(that.scene, that.camera);
            that.scene.update(dt);
            
            if(APP.capturer)
                APP.capturer.capture( that.renderer.canvas );
            
            //get old camera
            that.camera.previous = vec3.clone(that.camera._position);
        }

        window.onresize = this.resize;
        this.resize();
        this.context.animate(); //launch loop

        this.context.onupdate = function(dt) {
            _dt = dt;
        }

        this.context.onmousemove = function(e)
        {
            mouse = [e.canvasx, gl.canvas.height - e.canvasy];

            if (e.dragging && e.leftButton) {
                that.camera.orbit(-e.deltax * 0.5 * _dt, RD.UP);
                that.camera.orbit(-e.deltay * 0.5 * _dt, that.camera._right);
            }
            if (e.dragging && e.rightButton) {
                that.camera.moveLocal([-e.deltax * _dt, e.deltay * _dt, 0]);
            }
        }

        this.context.onmousewheel = function(e)
        {
            if(!e.wheel)
                return;

            that.camera.position = vec3.scale( that.camera.position, that.camera.position, e.wheel < 0 ? 1.05 : 0.95 );
        }

        this.context.onkeydown = function(e)
        {
            keys[e.keyCode] = true;      
        }
        
        this.context.onkeyup = function(e)
        {   
            keys[e.keyCode] = false;        

            if(e.keyCode === KEY_ENTER) // Enter
                APP.applyRotation(that.model._rotation);

            if(e.keyCode === KEY_ESC)
                APP.disableAllFeatures();
            
            if(e.keyCode === KEY_S)
                that.renderer.loadShaders("data/shaders/shaders.glsl");
        }

        this.context.captureMouse(true);
        this.context.captureKeys();
    },
    /*
    * destroy elements by description attr
    */
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
    /*
    * load new texture for cubemap and set as skybox texture
    * in the renderer
    */
    setCubeMap: function( url )
    {
        if(!url){
            this.skybox.shader = "basic"; 
            return;
        }
        this.skybox.shader = "skybox"; 
        var cubeMaptexture = GL.Texture.cubemapFromURL(url,{is_cross: 1, minFilter: gl.LINEAR_MIPMAP_LINEAR });
        this.renderer.textures["skybox"] = cubeMaptexture;  
        cubeMaptexture.bind(0);
    },
    /*
    * 
    */
    test: function(param)
    {
        
    },
    /*
    * takes a photo of the renderer canvas
    */
    takeSnapshot: function()
    {
        // clear capturing box
        APP.disableAllFeatures({no_msg: true});
        putCanvasMessage({
            es: "Capturando escena...",
            cat: "Capturant escena...",
            en: "Taking snapshot..."
        }, 10000);

        // get final canvas
        var canvas = gl.snapshot(0, 0, GFX.renderer.canvas.width, GFX.renderer.canvas.height);

        function on_complete( img_blob )
            {
                $("#cont-msg").empty();
                var src = canvas.toDataURL();
                var url = URL.createObjectURL( img_blob );
                var img = new Image();
                img.src = src;
                img.className = "download-image";
                $("#capturing").append("<a href='"+url+"' download='screenshot.png' class='btn table-btn'>Download</a>");
                $("#capturing").append("<a data-url='"+src+"' onclick='uploadBLOB($(this))' class='btn table-btn'>Add to project</a>");
                $("#capturing").append( img );
                $("#capturing").append("<a onclick='APP.disableAllFeatures()' class='btn table-btn'>Cancel</a>").fadeIn();
            }

        canvas.toBlob( on_complete, "image/png");  
    },
    /*
    * resize method for canvas
    */
    resize: function() 
    {
        var that = GFX;
        console.log("resize");
        
        that.context.canvas.width   = that.placer.clientWidth;
        that.context.canvas.height  = that.placer.clientHeight;
        that.context.viewport(0, 0, that.context.canvas.width, that.context.canvas.height);

        if(that.camera)
            that.camera.perspective(that.camera.fov, that.placer.clientWidth / that.placer.clientHeight, that.camera.near, that.camera.far);
    },
    /*
    * transform canvas to full screen
    */
    goFullscreen: function()
    {
        if(this.renderer.gl.fullscreen)
            this.renderer.gl.fullscreen();
        else
            console.error("fullscreen not supported");
    }
}