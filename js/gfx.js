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
        this.camera.direction = vec3.create();
        vec3.copy(this.camera.direction, this.camera._position);
        this.camera.previous =  vec3.create();
        vec3.copy(this.camera.previous, this.camera._position);
        
        var wBinURL = meshURL.split(".")[0] + ".wbin";
        
        //create an obj in the scene
        var model = new RD.SceneNode();
        model.name = "mesh 3d";
        model.position = [0,0,0];
        model.scale([5,5,5]);
        model.mesh = wBinURL;
        
        if (!isArray(textureURL)) {
            model.texture = textureURL;
        }
        
        this.model = model;
        
        var on_load = function()
        {
            that.renderer.meshes[that.model.mesh] = mesh;  
            $("#placeholder").css("background-image", "none");
            $("#placeholder").css("cursor", "default");
            $('#myCanvas').css({"opacity": 0, "visibility": "visible"}).animate({"opacity": 1.0}, 1500);

            if(rotaciones && !rotaciones.length)
            {
                putCanvasMessage({
                    es: "No hay rotaciones por defecto",
                    cat: "No hay rotacions per defecte",
                    en: "No rotations by default"
                }, 2500, {type: "error"}); 
            }
        }
        
        $("#placeholder").css("cursor", "wait");
        
        mesh = GL.Mesh.fromURL( that.model.mesh, function (response){
            if(response === null)
                that.uploadBinaryMesh( meshURL, wBinURL );
        });
        
        // make canvas visible after loading texture
        that.renderer.loadTexture(that.model.texture, that.renderer.default_texture_settings, on_load);
        
        // *************************************
        
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
                onupdate: "blink",
                name: "annotation"
            });

            // set ball parent
            setParent(that.model, ind.node);
        }

        //global settings
        var bg_color = vec4.fromValues(0.937, 0.937, 0.937, 1);

        //main render loop
        function ondraw() {
            
            // smoother changes of camera
            that.lookAtSmooth(that.camera);
            
            // clear buffers
            that.renderer.clear(bg_color);

            // orbit depending on orbit speed
            if(that.orbit_speed)
                that.camera.orbit(that.orbit_speed, RD.UP);
            
            //smoothing camera
            if(that.camera.smooth){
                vec3.scale(that.camera.position, that.camera.position, 0.05);
                vec3.scale(that.camera.previous, that.camera.previous, 0.95);
                vec3.add(that.camera.position, that.camera.position, that.camera.previous);
            }
            
            that.skybox.position = that.camera.position;
            that.renderer.render(that.scene, that.camera);
            
            //get old camera
            vec3.copy(that.camera.previous, that.camera._position);
        }

        window.onresize = this.resize;
        this.resize();
        this.context.animate(); //launch loop
        this.context.ondraw = ondraw;
        
        this.context.onupdate = function(dt) {
            _dt = dt;
            // update all scene
            that.scene.update( dt );
        }

        this.context.onmousemove = function(e)
        {
            mouse = [e.canvasx, gl.canvas.height - e.canvasy];
            
            if( e.dragging ) {
                if( e.leftButton ) {
                    
                    //create camera
//                    var camera = new RD.Camera();
//                    camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
//                    camera.lookAt( GFX.camera.position, GFX.camera.target, GFX.camera.up );
//                    
//                    camera.direction = vec3.create();
                    
//                    vec3.copy(this.camera.direction, this.camera._position);
//                    
//                    this.camera.previous =  vec3.create();
//                    
//                    vec3.copy(this.camera.previous, this.camera._position);
                    
                    that.camera.orbit(-e.deltax * 0.5 * _dt, RD.UP);
                    that.camera.orbit(-e.deltay * 0.5 * _dt, that.camera._right);
                }
                if( e.rightButton ) {
                    that.camera.moveLocal([-e.deltax * 0.075, e.deltay, 0]);
                }
            }
        }
        
        this.context.onmousedown = function(e)
        {
            GFX.lookAnotInfo( e );  
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
    setDialogHere: function( event, node )
    {
        var lang = "es", session_lang = null;
        if(session_lang = localStorage.getItem("lang"))
            lang = session_lang;
        
        var name = DATA.litegui.sections.data.desc[lang], last_dialog = null;
        var dialog_id = name.replace(" ", "-").toLowerCase();
        
        if( last_dialog = document.getElementById( dialog_id ) )
            last_dialog.remove();
        
        var dialog = new LiteGUI.Dialog( dialog_id, {parent: "body", title: name, close: true, width: 185, scroll: true, draggable: true });
        dialog.show('fade');
        
        var widgets = new LiteGUI.Inspector();
        
        widgets.on_refresh = function(){
            widgets.clear();
            var desc = null;
            if(document.getElementById( node.id )){
                desc = document.getElementById( node.id ).innerText;
                desc = desc.slice(1, desc.length);
                desc = capitalizeFirstLetter( desc );
                widgets.addInfo(null, desc);
            }
        }

        widgets.on_refresh();
        dialog.add(widgets);  
        
        dialog.setPosition( event.canvasx + 25 , GFX.renderer.canvas.height - event.canvasy + 25 );
    },
    lookAnotInfo: function(e)
    {
        if( e.leftButton ) {
            window.test = vec3.create();
            var ray = GFX.camera.getRay( e.canvasx, e.canvasy ), node = null;
            if ( node = GFX.model.testRay( ray, window.test, undefined, 0x4, true ))
                if(node.name && node.name == "annotation"){
                    GFX.setDialogHere( e, node );  
                    for(var i = 0, child; child = GFX.model.children[i]; i++)
                        child.active = false;
                    // only one active
                    node.active = true;
                }
        }
    },
    /*
    * upload binary mesh in case of first use
    */
    uploadBinaryMesh: function(meshURL, wBinURL, callback)
    {
        console.warn("no binary mesh found");
        // load obj
        this.model.mesh = meshURL;
        mesh = GL.Mesh.fromURL( meshURL, function (response) {
            if(response === null)
                throw( "no mesh either obj or wbin found" );
            
            else// upload binary mesh for next use
            {
                var file = mesh.encode("wbin");
                if(file)
                {
                    var fileReader = new FileReader();
                    fileReader.onload = function() {
                            var arrayBuffer = this.result;
                            var wBinURLshort = wBinURL.slice( wBinURL.lastIndexOf( "/" ) );
                            var fullpath = current_user + "/projects/" + project._id + "/" + wBinURLshort;
                            session.uploadFile( fullpath, arrayBuffer, 0, function(){
                                console.log("binary uploaded");
                            }, function(err){
                                console.error(err);
                            });
                    };
                    fileReader.readAsArrayBuffer( new Blob([file]) );
                }else
                    console.error("encoding error");

                if(callback)
                    callback();
            }
        }); //load from URL
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
    record_orbit: function( capturer )
    {
        var do_this = function(){
            
            capturer = capturer || new CCapture( { 
                    name: "Orbita",
                    quality: 85,
                    format: "webm",
                    } );  
            
            //create camera
            var camera = new RD.Camera();
            camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
            
            vec3.copy( camera.position, GFX.camera.position );
            vec3.copy( camera.target, GFX.camera.target );
            vec3.copy( camera.up, GFX.camera.up );
            
            capturer.start();
            var bg_color = vec4.fromValues(0.937, 0.937, 0.937, 1);
            
            var speed = APP.export_data.export_speed;
            
            for( var dt = 0; dt < 360 * DEG2RAD; dt += speed)
            {
                GFX.renderer.clear(bg_color);
                GFX.renderer.render( GFX.scene, camera );
                camera.orbit( speed, RD.UP );
                capturer.capture( GFX.renderer.canvas );
            }
            
            $("#capture-widget").remove();
            capturer.stop();
            capturer.save();
        };
        
        putCanvasMessage({
                es: "Grabando órbita, #%w=5q!p{*]s@s...", cat: "Gravant òrbita, #%w=5q!p{*]s@s...", en: "Recording orbit, #%w=5q!p{*]s@s..."
            }, 1000);
        setTimeout(do_this, 500);
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
                
                var lang = "es", session_lang = null;
                if(session_lang = localStorage.getItem("lang"))
                    lang = session_lang;
                
                var buttons = DATA.buttons;
                
                var download_button = document.createElement("a");
                download_button.innerHTML = buttons.download_capture[lang];
                download_button.href = url;
                download_button.download = "screenshot.png";
                download_button.className = "btn table-btn";
                
                var add_button = document.createElement("a");
                add_button.innerHTML = buttons.add_capture[lang];
                add_button.id = "upload-capture-button";
                add_button.dataset.url = src;
                add_button.className = "btn table-btn";
                $(add_button).click(function(){
                    uploadBLOB($(this));
                });
                
                var dialog = GFX.createCaptureDialog( lang );
                var section = $(".wsection.capture-section").find(".wsectioncontent");
                section.append( img );
                section.append( download_button );
                section.append( add_button );
            }

        canvas.toBlob( on_complete, "image/png");  
    },
    /*
    * create dialog to contain captured image (export stuff)
    */
    createCaptureDialog: function(lang)
    {
        var text_section = DATA.litegui.sections.capture;
        var name = {"es": "Capturado", "cat": "Capturat", "en": "Captured"}[lang];
        var dialog = new LiteGUI.Dialog(name, {parent: "body", title: name, close: true, width: 300, scroll: true, draggable: true });
        dialog.show('fade');
        
        var widgets = new LiteGUI.Inspector();
        widgets.addSection("...", {className: "capture-section"});
        dialog.add(widgets);
        return dialog;
    },
    /*
    * set position of camera to be the direction until objective is reached
    */
    lookAtSmooth: function(camera)
    {
        if(!equals(camera.position, camera.direction) && camera.smooth)
            camera.position = camera.direction;
        else
            camera.smooth = false;
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
    },
    /*
    * make nº orbits depending on speed
    * @param speed {Num} 0..1
    */
    makeOrbit: function(speed, it, on_complete)
    {
        console.log("orbiting");
        
        it = it || 1;
        speed = speed || 0.5;
        
        if(!speed || !it)
            throw( "bad params" );
        
        if(speed > 3 || it > 5)
            throw( "passed max params value" );
        
        window.orbitCounter = 0;
        
        var updateModel = function(dt){
            
            if( window.orbitCounter > (360 * DEG2RAD) * it)
            {
                if(on_complete)
                    on_complete();
                
                GFX.model.update = undefined;
                window.orbitCounter = undefined;
                console.log("orbit done");
            }
            else{
                GFX.camera.orbit(speed * dt, RD.UP);
                window.orbitCounter += speed * dt;
            }
        };

        GFX.model.update = updateModel;
    },
    /*
    * render any type of measure
    * @param o {object} measure to render
    */
    renderMeasure: function(o)
    {
        o = o || {};
    	var id = o.id;
    	var type = o.type;
    	var msr = null;

        // clear first
        GFX.destroyElements(GFX.scene.root.children, "config");
        
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
            list.push(msr.points[i][0], msr.points[i][1], msr.points[i][2]);
            points.push(list);
            // ball render representation
            var ind = new SceneIndication({
                position: points[i],
                scene: true,
                color: [0.258, 0.525, 0.956,1],
                depth_test: false,
                render_priority: RD.PRIORITY_HUD
            });
        }    
        
        APP.addLine(points, {desc: "config"});

        // change global camera to look at with smooth efect
        if(msr.camera_position)
        {
            GFX.camera.direction = msr.camera_position;
            GFX.camera.smooth = true;    
        }
    }
}