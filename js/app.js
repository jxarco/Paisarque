var project         = null;
var _dt             = 0.0;

var APP = {
    // rotation mode
    rotation: false,
    // visibility of anotations
    anot_visible: true,
    // qnt of rotation of the slider
    value: 0,
    // result of collisions
    result: vec3.create(),
    // visibility of tables (measures)
    showing: {
        t1: false, // distances
        t2: false, // segments
        t3: false, // areas
    },

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
        
        APP.init( meshURL, textURL );
    },
    
    init: function(meshURL, textURL)
    {
//        APP.info_inspector = new LiteGUI.Inspector();
//        APP.info_inspector.addCheckbox("Auto-save", project._auto_save, { callback: function(v) { 
//            if(project._auto_save != v){
//                project._auto_save = v;
//                project.save();    
//            }
//        }});
//        $("#tab-content1-large").append(APP.info_inspector.root);
        
        APP.tools_inspector = new LiteGUI.Inspector("tools_inspector");
        APP.tools_inspector.addButton(null,"Guardar", { width: "100%",  callback: function(){
            project.save();
        }});
        APP.tools_inspector.addButton(null,"Pantalla completa", { width: "100%",  callback: function(){
            GFX.goFullscreen();
        }});
        APP.tools_inspector.addButton(null,"Capturar", { width: "100%",  callback: function(){
            GFX.takeSnapshot();
        }});
        APP.tools_inspector.addNumber("Orbitar", 0, { width: "100%",  callback: function(v){
            GFX.go_orbit(null, v);
        }, min: -1, max: 1});
        
        $("#tab-content2-large").append(APP.tools_inspector.root);
        
        // finish and run GFX stuff
        GFX.init( meshURL, textURL );  
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

            GFX.context.onmousedown = function(e) 
            {
                var ray = GFX.camera.getRay( e.canvasx, e.canvasy );
                var node = GFX.scene.testRay( ray, APP.result, undefined, 0x1, true );

                // Si ha habido colision, se crea un punto y se abre una ventana de texto para escribir la anotacion
                if (node)
                    $('#modalText').modal('show');
            }

        } else if (!modoAnotacion) {
            $("#desAnot").css('opacity', '0.2');
            $("#actAnot").css('opacity', '1');
            GFX.context.onmousedown = function(e) {}
        }
    },
    
    showElements: function (elements, flag)
    {
        for(var i = 0; i < elements.length; i++)
            elements[i].flags.visible = flag;
    },
    
    setRotation: function ()
    {
        if(project._rotations.length)
            if(!confirm("Ya hay rotaciones por defecto en este proyecto. Si continuas se perderán todas las distancias medidas."))
                return;

        // clear first
        APP.disableAllFeatures({no_msg: true});
        project._measures = [];
        project._segments = [];
        project._areas = [];
        $("#distances-table").find("tbody").empty();
        $("#segment-distances-table").find("tbody").empty();
        $("#areas-table").find("tbody").empty();

        APP.rotation = true;
        revealDOMElements([$("#cardinal-axis"), $('.sliders')], true)
        
        // create grid
        var rot_grid_x = new SceneIndication();
        rot_grid_x.grid(4);
        GFX.scene.root.addChild( rot_grid_x.node );
        var rot_grid_y = new SceneIndication();
        rot_grid_y.grid(4, {rotations: [{angle: 90 * DEG2RAD, axis: RD.FRONT}]});
        GFX.scene.root.addChild( rot_grid_y.node );
        var rot_grid_z = new SceneIndication();
        rot_grid_z.grid(4, {rotations: [{angle: 90 * DEG2RAD, axis: RD.FRONT}, {angle: 90 * DEG2RAD, axis: RD.LEFT}]});
        GFX.scene.root.addChild( rot_grid_z.node );

        var msg = {
            es: "Usa los sliders o las teclas A, S, D",
            cat: "Utilitza els sliders o les tecles A, S, D",
            en: "Use the sliders or A, S, D keys"
        }
        putCanvasMessage(msg, 5000, {type: "help"});

        GFX.context.onmousemove = function(e)
        {
            mouse = [e.canvasx, gl.canvas.height - e.canvasy];
            if (e.dragging && e.leftButton)
                if(keys[KEY_A])
                    GFX.model.rotate(-e.deltax * 0.1 * _dt, RD.UP);
                else if(keys[KEY_S])
                    GFX.model.rotate(-e.deltax * 0.1 * _dt, RD.FRONT);
                else if(keys[KEY_D])
                    GFX.model.rotate(-e.deltax * 0.1 * _dt, RD.LEFT);
                else{
                    GFX.camera.orbit(-e.deltax * 0.1 * _dt, RD.UP);
                    GFX.camera.orbit(-e.deltay * 0.1 * _dt, GFX.camera._right);
                }
        }
    },
    
    applyRotation: function()
    {
        if(APP.rotation){
            APP.rotation = false;
            for(var i = 0, node; node = GFX.scene.root.getNodesByName("grid")[i]; i++)
                node.delete(); // remove help grid
            revealDOMElements([$("#cardinal-axis"), $('.sliders')], false);
            
            project.setRotations(GFX.model._rotation);
            project.save();
            var msg = {
                es: "¡Guardado!",
                cat: "Desat!",
                en: "Saved!"
            }
            putCanvasMessage(msg, 4000, {type: "response"});
            
             // upload project preview
            var canvas = gl.snapshot(0, 0, GFX.renderer.canvas.width, GFX.renderer.canvas.height);
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

    setScale: function ()
    {
        // clear first
        APP.disableAllFeatures({no_msg: true});
        
        if(project._meter != -1)
        {
            var msg = {
                es: "La cofiguración de la escala ya se ha realizado antes",
                cat: "L'escala ja ha sigut configurada abans",
                en: "Scale set up before"
            }
            putCanvasMessage(msg, 5000, {type: "alert"});    
        }

        testDialog({scale: true, hidelower: true}); // open dialog
        window.tmp = [];
        
        $("#add-dialog").click(function(){
            selectDialogOption($(this));
            var on_complete = function(){
                if(tmp.length == 2)
                    APP.applyScale(tmp);
            };
            APP.set3DPoint(on_complete);
        }); 
        $("#help-dialog").click(function(){
            if($(".dialog-option.help").css("display") == "none")
                $(".dialog-option.help").fadeIn();
            else
                $(".dialog-option.help").fadeOut();
        });
        $("#add-dialog").click();
    },
    
    applyScale: function( point_list )
    {
        var scale = parseFloat($("#scale-input").val()) || 1;
        var relation = vec3.dist(point_list[0], point_list[1]) / scale;
        project.update_meter(relation);
        APP.disableAllFeatures();  // disabling here the mousedown event
    },
    
    set3DPoint: function( on_complete )
    {
        $("#myCanvas").css("cursor", "crosshair");

        GFX.context.onmousedown = function(e) 
        {
            var result = vec3.create();
            var ray = GFX.camera.getRay( e.canvasx, e.canvasy );
            var node = GFX.scene.testRay( ray, result, undefined, 0x1, true );
            if (node) {
                var ind = new SceneIndication({
                    scene: true,
                    position: result,
                    color: [0.3,0.8,0.1,1]
                });
                tmp.push(result);
            }
            
            if(on_complete)
                on_complete();
        }  
    },
    
    set3DAreaPoint: function( area_type )
    {   
        GFX.context.onmousedown = function(e) 
        {
            var ray = GFX.camera.getRay( e.canvasx, e.canvasy );
            var result = vec3.create();

            if(window.base_added)
            {
                if(!GFX.scene.testRay( ray, result, undefined, 0x1, true ))
                    return;
                
                if(nodes_used.length){
                    // remove blink from other points
                    nodes_used[nodes_used.length - 1].active = false;
                    // adjust to same point if first point is too close
                    var pos_first = vec3.create();
                    pos_first = vec3.clone( nodes_used[0].getGlobalPosition() );
                    if(vec3.dist(pos_first, result) < 2)
                        result = pos_first;
                    
                    if(nodes_used.length > 1) // only when more than one to make the line between them
                        APP.addLine(nodes_used, {node_list: true});
                }
                
                var world_coord = vec3.clone( result );
                
                var ind = new SceneIndication({
                    scene: true,
                    position: world_coord,
                    color: [0.3,0.8,0.1,1],
                    time: 0.0,
                    active: true,
                    onupdate: "blink"
                });
                
                var plane = GFX.scene.root.getNodeByName("area-plane");
                setParent(plane, ind.node, true);
                nodes_used.push( ind.node );
            }
            else
                if(GFX.scene.testRay( ray, result, undefined, 0x1, true )){
                    GFX.model.flags.ignore_collisions = true; // points are now stuff for plane
                    APP.addAreaBase(result, area_type);
                    window.base_added = true;
                }
        }  
    },
    
    createDistance: function(point_list, on_complete)
    {
        if(point_list.length < 2) 
            return;

        APP.disableAllFeatures(); //clear all

        var distance = 0; // add all distances
        for(var i = 0; i < point_list.length - 1; ++i)
            distance += vec3.dist(point_list[i], point_list[i+1]);

        distance /= project._meter;

        if(point_list.length == 2)
            project.insertMeasure(GFX.camera, point_list, distance, "nueva_dist", project._default_measure_options);
        else 
            project.insertSegmentMeasure(GFX.camera, point_list, distance, "nuevo_segs", project._default_measure_options);  
    },
    
    calcDistance: function ()
    {
        // clear first
        APP.disableAllFeatures({no_msg: true}); 
        
        if(project._meter == -1){
            var msg = {
                es: "Falta configurar la escala",
                cat: "Primer has de configurar l'escala",
                en: "Set up the scale first"
            }
            putCanvasMessage(msg, 3000, {type: "error"});
            return;
        }
        
        testDialog();       // open tools panel
        window.tmp = [];    // save points

        $("#add-dialog").click(function()
        {
            selectDialogOption($(this));
            var on_complete = function(){
                // create line between points when possible
                if(tmp.length > 1)
                    APP.addLine(tmp);
            };
            APP.set3DPoint(on_complete);
        });
        $("#end-dialog").click(function(){
            APP.createDistance(tmp);
        });
        // begin with an option selected
        $("#add-dialog").click();
    },
    
    createArea: function(index, nodes)
    {
        var real_positions = [], old_positions = [], points2D = [];
        
        // get positions before rotating the plane to show the area later
        for(var it in nodes){
            var node = nodes[it];
            var node_global_position = vec3.create();
            node_global_position = vec3.clone( node.getGlobalPosition() );
            old_positions.push( node_global_position );
        }
        
        // rotate plane to easy calculation
        var plane = GFX.scene.root.getNodeByName("area-plane");
        plane._rotation = [0, 0, 0, 1];
        plane.updateMatrices();
        
        for(var it in nodes){
            var node = nodes[it];
            // get world space position from each node to calculate real distances
            var node_global_position = vec3.create();
            node_global_position = vec3.clone( node.getGlobalPosition() );
            // add position in world space
            real_positions.push( node_global_position );
            // add position in 2d (x-z)
            points2D.push( vec2.fromValues(node_global_position[0], node_global_position[2]) );
        }
        
        // calculate area with math formula
        var left = 0, right = 0;
        for(var i = 0; i < points2D.length - 1; ++i)
        {
            var current = points2D[i], next = points2D[i+1];
            left += current[0] * next[1];
            right += current[1] * next[0];
        }
        var area = Math.abs(0.5 * (left - right));

        // pass it to m2
        area /= Math.pow(project._meter, 2);

        // clear
        APP.disableAllFeatures();
        project.insertArea(old_positions, area, index, "nueva_area", project._default_measure_options);
    },
      
    calcArea: function ( area_type )
    {
        // clear first
        APP.disableAllFeatures({no_msg: true});

        if(project._meter == -1){
            putCanvasMessage({
                es: "Falta configurar la escala",
                cat: "Primer has de configurar l'escala",
                en: "Set up the scale first"
            }, 3000, {type: "error"});
            return 0;
        }
        
        //open dialog tools
        testDialog();
        window.nodes_used = [];
        window.base_added = false;

        $("#add-dialog").click(function(){ 
            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");
            APP.set3DAreaPoint(area_type);
        });
        $("#end-dialog").click(function(){
            if(nodes_used.length > 2)
                APP.createArea((area_type+1), nodes_used);
        });
        // begin with an option selected
        $("#add-dialog").click();
    },
    
    addLine: function(points, options)
    {
        options = options || {};
        var positions = null;
        
        // option for scene node list
        if(options.node_list){
            positions = [];
            for(var i = 0; i < points.length; ++i)
            {
                positions.push( vec3.clone( points[i].position ) );
            }
            points = positions;
        }
        
        var vertices = [];
        GFX.destroyElements(GFX.scene.root.children, "config-tmp"); // clear last line
        for(var i = 0; i < points.length; ++i)
        {
            vertices.push(points[i][0], points[i][1], points[i][2]);
            if(i)
                vertices.push(points[i][0], points[i][1], points[i][2]);
        }
        
        var mesh = GL.Mesh.load({ vertices: vertices }); 
        GFX.renderer.meshes["line"] = mesh;
        var linea = new RD.SceneNode();
        linea.name = "line";
        linea.description = "config-tmp";
        linea.flags.ignore_collisions = true;
        linea.primitive = gl.LINES;
        linea.mesh = "line";
        linea.color = [0.9,0.7,0.7,1];
        linea.flags.depth_test = false;
        linea.render_priority = RD.PRIORITY_HUD;
        
        if(options && options.desc)
            linea.description = options.desc;
        
        GFX.scene.root.addChild(linea);        
    },
    
    addAreaBase: function(basePoint, areaType)
    {
        var plane = new RD.SceneNode({
                mesh: "planeXZ",
                position: basePoint,
                scaling: 300,
                opacity: 0.55,
                color: [0, 0.439, 0.788]
        });
        plane.name = "area-plane";
        plane.description = "config";
        plane.render_priority = RD.PRIORITY_ALPHA;
        plane.blend_mode = RD.BLEND_ALPHA;
        plane.flags.two_sided = true;
        
        if(areaType !== TOP_AREA)
            plane.rotate(90 * DEG2RAD, RD.FRONT);
        GFX.scene.root.addChild(plane); 
        
        // add buttons to move plane
        APP._plane_rotation_ = [0, 0];
        APP.inspector = new LiteGUI.Inspector();
        var string = {
            es: "Ajustar",
            cat: "Adjustar",
            en: "Adjust"
        }
        var lang = "es", session_lang;
        if(session_lang = localStorage.getItem("lang"))
            lang = session_lang;
        APP.inspector.addVector2(string[lang], null, {callback: function(v){
            if(v[0] > APP._plane_rotation_[0])
                plane.rotate(v[0] * DEG2RAD, RD.FRONT);    
            if(v[0] < APP._plane_rotation_[0])
                plane.rotate(-v[0] * DEG2RAD, RD.FRONT);

            if(v[1] > APP._plane_rotation_[1])
                plane.rotate(v[1] * DEG2RAD, RD.LEFT);
            if(v[1] < APP._plane_rotation_[1])
                plane.rotate(-v[1] * DEG2RAD, RD.LEFT);

            plane.updateMatrices();
            APP._plane_rotation_ = v;
        }, step: 0.005, min: 0});
        
        $(".draggable").append(APP.inspector.root);
    },
    
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
            var ind = new SceneIndication();
            ind = ind.ball(GFX.scene, points[i], {depth_test: false, type: "view"});    
        }    
        
        APP.addLine(points, {desc: "config"});

        // change global camera to look at with smooth efect
        if(msr.camera_position)
        {
            GFX.camera.direction = msr.camera_position;
            GFX.camera.smooth = true;    
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

        GFX.model.rotate(to_rotate, axis);
        APP.value = slider.value;
    },

    disableAllFeatures: function (options)
    {
        options = options || {};
        GFX.context.onmousedown = function(e) {};
        
        APP.fadeAllTables(this.showing);
        APP.rotation = false;
        revealDOMElements([$("#cardinal-axis"), $('.sliders'), $(".sub-btns")], false);
        GFX.destroyElements(GFX.scene.root.children, "config");
        GFX.destroyElements(GFX.scene.root.children, "config-tmp");
        GFX.model.flags.ignore_collisions = false;
        $("#measure-opt-btn").find("i").html("add_circle_outline");
        $("#myCanvas").css("cursor", "default");
        $(".draggable").remove();
//        $("#cont-msg").empty();
        
        // remove helping grid
        var grid = GFX.scene.root.getNodeByName("grid");
        if(grid)
            grid.destroy();

        //remove active classes
        $(".on-point").removeClass("on-point");
        $("#tools-tab .btn.tool-btn").removeClass("pressed");
        
        // clear capturing box
        $("#capturing").fadeOut().empty();
        
        if(options.no_msg)
            return;
        
        var msg = options.msg || {
            es: "Hecho",
            cat: "Fet",
            en: "Done"
        };
        var ms = options.ms || 1250;
        putCanvasMessage(msg, ms);
    },
    
    fadeAllTables: function (o)
    {
        // flags for visibility
        for(var i in o)
            o[i] = false;
        
        var list = [];
        list.push($('#distances-table'), $('#measure-btn'), $('#segment-distances-table'));
        list.push($('#measure-s-btn'), $('#areas-table'), $('#measure-opt-btn'));
        revealDOMElements(list, false, {e: ""});
    }
}