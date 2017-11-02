var project         = null;
var _dt             = 0.0;

var APP = {
    // rotation mode
    rotation: false,
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

        var renderData = project._render;
        if(!renderData.mesh) {
            console.error("There is no mesh");
            return;
        }

        var root = "litefile/files/" + current_user + "/projects/";
        var meshURL = root + renderData.mesh;
        var textURL = root + renderData.texture;
        
        APP.init( meshURL, textURL );
    },
    
    init: function(meshURL, textURL)
    {  
        var lang = localStorage.getItem("lang") || "es";
        var that = this;
        
        if(!DATA)
            throw( "no translations" );
        
        that.createInfoInspector(lang);
        that.createToolsInspector(lang);
        that.createAnotInspector(lang);
            
        // finish and run GFX stuff
        GFX.init( meshURL, textURL );  
    },
    
    createInfoInspector: function(lang)
    {
        APP.info_inspector = new LiteGUI.Inspector();
        var text_section = DATA.litegui.sections.data;
        
        APP.info_inspector.addSection( text_section.title[lang] );
        APP.info_inspector.addString( text_section.author[lang], project._author, { width: "100%", callback: function(v){
            project.setAuthor(v);
        }});
        APP.info_inspector.addString( text_section.loc[lang], project._location, { callback: function(v){
            project.setLocation(v);
        }});
        APP.info_inspector.addString( text_section.desc[lang], project._description, { callback: function(v){
            project._description = v;
        }});
        
        text_section = DATA.litegui.sections.map;
        APP.info_inspector.addSection( text_section.title[lang], {className: "map-section"} );
        APP.info_inspector.addString( text_section.lat[lang], project._coordinates.lat, { width: "100%",  callback: function(v){
            project._coordinates.lat = parseFloat( v );
            initMap(); 
        }, step: 0.0001});
        APP.info_inspector.addString( text_section.lng[lang], project._coordinates.lng, { width: "100%",  callback: function(v){
            project._coordinates.lng = parseFloat( v );
            initMap(); 
        }, step: 0.0001});
        
        text_section = DATA.litegui.sections.cubemaps;
        APP.info_inspector.addSection( text_section.title[lang], {className: "cubemap-section"} );
        APP.info_inspector.addButton(null, text_section.quit[lang], { width: "100%",  callback: function(){
            GFX.setCubeMap(null);
        }});
        
        $("#tab-content1-large").prepend(APP.info_inspector.root);
        $(".wsection.map-section").find(".wsectioncontent").append($("#map"));
        $(".wsection.cubemap-section").find(".wsectioncontent").prepend($("#cubemaps"));
    },
    
    createToolsInspector: function(lang)
    {
        APP.tools_inspector = new LiteGUI.Inspector("tools_inspector");
        var text_section = DATA.litegui.sections.general;
        
        APP.tools_inspector.addSection( text_section.title[lang] );
        APP.tools_inspector.addCheckbox( text_section.auto_save[lang], project._auto_save, { callback: function(v){
            project._auto_save = v;
            project.save();
        }});
        APP.tools_inspector.addButton(null, text_section.save[lang], { width: "100%",  callback: function(){
            project.save();
        }});
        APP.tools_inspector.addButton(null, text_section.fullscreen[lang], { width: "100%",  callback: function(){
            GFX.goFullscreen();
        }});
        
        text_section = DATA.litegui.sections.camera;
        APP.tools_inspector.addSection( text_section.title[lang], {collapsed: true});
        APP.tools_inspector.addButton(null, text_section.reset[lang], { width: "100%",  callback: function(){
            GFX.camera.perspective( 45, gl.canvas.width / gl.canvas.height, 0.1, 10000 );
            GFX.camera.lookAt( [150,60,150],[0,0,0],[0,1,0] );
            GFX.camera.direction = [150,60,150];
            GFX.camera.previous = vec3.clone(GFX.camera._position);
        }});
        APP.tools_inspector.addNumber( text_section.orbit[lang], 0, { width: "100%",  callback: function(v){
            GFX.orbit_speed = v * 0.001;
        }, min: -10, max: 10, step: 0.1});
        
        text_section = DATA.litegui.sections.model;
        APP.tools_inspector.addSection( text_section.title[lang], {className: "model3d-section"});
        APP.tools_inspector.addButton( text_section.rotations[lang], text_section.config_rot[lang], { width: "100%",  callback: function(){
            APP.setRotation();
        }});
        
        text_section = DATA.litegui.sections.measures;
        APP.tools_inspector.addSection( text_section.title[lang], {className: "measures-section"});
        APP.tools_inspector.addButton( text_section.scale[lang], text_section.config_scale[lang], { width: "100%",  callback: function(){
            APP.setScale();
        }});
        APP.tools_inspector.addCombo( text_section.log[lang], "...",{values: text_section.log_values[lang], callback: function(v) { APP.showMeasureTables(v); }});
        APP.tools_inspector.addSeparator();
        APP.tools_inspector.addButton( text_section.dist[lang], text_section.create_dist[lang], { width: "100%",  callback: function(){
            APP.appendNewMeasure(PW.OD);
        }});
        APP.tools_inspector.addButtons( text_section.area[lang], text_section.area_values[lang],{callback: function(v) {        
            APP.appendNewMeasure(PW.AREA, v);
        }});
        
        text_section = DATA.litegui.sections.export;
        APP.tools_inspector.addSection( text_section.title[lang], {className: "export-section"});
        
        // default options
        APP.export_data = {
            format: "webm",   
            framerate: 40,
            mb_frames: 0,
            quality: 60,
            name: "exported",
            verbose: false,
            display: true,
            
                export_speed: 0.025,
                n_iterations: 1
        }
        APP.tools_inspector.addButton( text_section.image[lang], text_section.image_btn[lang], { width: "100%", callback: function(){
            GFX.takeSnapshot();
        }});
        APP.tools_inspector.addButton( text_section.record[lang], text_section.record_btn[lang],{width: "100%", callback: function(v) {        
            GFX.record_orbit();
        }});
        
        APP.tools_inspector.addSeparator();
        APP.tools_inspector.addButton( null, text_section.advanced[lang], { width: "100%",  callback: function(){
            APP.createWidgetsDialog(lang);
        }});
        
        $("#tab-content2-large").append(APP.tools_inspector.root);
        
        $(".wsection.model3d-section").find(".wsectioncontent").append($(".sliders"));
        $(".wsection.measures-section").find(".wsectioncontent").append($("#distances-table"));
        $(".wsection.measures-section").find(".wsectioncontent").append($("#segment-distances-table"));
        $(".wsection.measures-section").find(".wsectioncontent").append($("#areas-table"));  
    },
    
    createWidgetsDialog: function(lang)
    {   
        // advanced options
        var text_section = DATA.litegui.sections.dialog;
        var name = text_section.title[lang];
        
        var dialog_id = name.replace(" ", "-").toLowerCase();
        if( document.getElementById( dialog_id ) )
            return;
        
        var dialog = new LiteGUI.Dialog( dialog_id, {parent: "body", title: name, close: true, width: 325, scroll: true, draggable: true });
        dialog.show('fade');
        
        var widgets = new LiteGUI.Inspector();
        
        widgets.on_refresh = function(){
        
            widgets.clear();
            
            widgets.addSection("...", {className: "advanced-export-section"});
            widgets.addButton( text_section.record[lang], text_section.record_btn[lang],{name_width: "33.33%", callback: function() {      
                APP.exportCanvas();
            }});
            widgets.addString( text_section.name[lang], APP.export_data.name,{ name_width: "33.33%", callback: function(v) { APP.export_data.name = v; }});
            widgets.addCombo( text_section.format[lang], APP.export_data.format,{ name_width: "33.33%", values:["webm","gif"], callback: function(v) { APP.export_data.format = v; }});
            widgets.addCombo( text_section.quality[lang], "Normal",{ name_width: "33.33%", values: text_section.quality_range[lang], callback: function(v) { APP.setQuality( v ); }});
            widgets.addCombo( text_section.speed[lang], "Normal", { name_width: "33.33%", values: text_section.speed_range[lang] , callback: function(v){  APP.setSpeedOrbit( v ); }});
            widgets.addSeparator();
        }

        widgets.on_refresh();
        dialog.add(widgets);  
        dialog.setPosition( 36, 136 );
        var progress = document.createElement("div");
        progress.className = "progress-line";
        $(".wsection.advanced-export-section").find(".wsectioncontent").prepend(progress);
    },
    
    createAnotInspector: function(lang)
    {
        APP.anot_inspector = new LiteGUI.Inspector();
        var text_section = DATA.litegui.sections.anot_options;
        
        APP.anot_inspector.addSection( text_section.title[lang], {className: "anot-section"});
        APP.anot_inspector.addCheckbox( text_section.show[lang], true, {callback: function(v){
            APP.showElements( GFX.model.children, v );
        }});
        APP.anot_inspector.addCheckbox( text_section.anotate[lang], false, {callback: function(v){
            APP.anotate( v );
        }});
        APP.anot_inspector.addSeparator();
        
        $("#tab-content3-large").prepend(APP.anot_inspector.root);
    },
    
    setQuality: function(name)
    {
        if(!name)
            throw( "no quality" );
        
        if(name == "Baixa" || name == "Baja" || name == "Low")
            APP.export_data.quality = 20;
        else if(name == "Normal")
            APP.export_data.quality = 60;
        else if(name == "Alta" || name == "High")
            APP.export_data.quality = 80;
        else
            APP.export_data.quality = 95;
    },
    
    setSpeedOrbit: function(name)
    {
        if(!name)
            throw( "no speed" );
        
        if(name == "Baixa" || name == "Baja" || name == "Low")
            APP.export_data.export_speed = 0.015;
        else if(name == "Normal")
            APP.export_data.export_speed = 0.025;
        else
            APP.export_data.export_speed = 0.035;
    },
    
    showMeasureTables: function(name)
    {
        APP.disableAllFeatures({no_msg: true});
        var table = null, btn = null, flag = null;
        
        if(name == "O-D")
        {
            APP.showing["t1"] = !APP.showing["t1"];
            table = $('#distances-table');
            btn = $('#measure-btn');
            flag = APP.showing["t1"];
        }
        
        else if(name == "Segmentos" || name == "Segments")
        {
            APP.showing["t2"] = !APP.showing["t2"];
            table = $('#segment-distances-table');
            btn = $('#measure-s-btn');
            flag = APP.showing["t2"];
        }
        
        else if(name == "Áreas" || name == "Àrees" || name == "Areas")
        {
            APP.showing["t3"] = !APP.showing["t3"];
            table = $('#areas-table');
            btn = $('#measure-opt-btn');
            flag = APP.showing["t3"];
        }
        
        else
            throw( "no table" );
        
        revealDOMElements([table, btn], flag);
    },
    
    appendNewMeasure: function(type, area_name)
    {
        if(typeof( type ) != "number")
            throw( "nothing to create" );
        
        if(type == PW.OD || type == PW.SGM)
        { 
            APP.calcDistance();  
        }
        
        else if(type == PW.AREA)
        { 
            if(area_name == "Planta" || area_name == "Top view")
                APP.calcArea(0);
            else
                APP.calcArea(1);
        }
    },
    
    exportCanvas: function(name)
    {
            var capturer = new CCapture( { 
            name: APP.export_data.name,
            verbose: APP.export_data.verbose,
            display: APP.export_data.display,
            framerate: APP.export_data.framerate,
            motionBlurFrames: APP.export_data.mb_frames,
            quality: APP.export_data.quality,
            format: APP.export_data.format,
            workersPath: 'js/extra/',
            onProgress: function( p ) { 
                    var progress = $(".progress-line");
                    if(p > 0 && progress.css("display") == "none")
                        progress.show();
                    var width = (p * 100) + "%"; 
                    progress.css("width", width);
                    if(p == 1)
                        progress.hide();
                }
            } );  

            GFX.record_orbit( capturer );
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
        APP.current_ms_type = null;
        APP.rotation = false;
        revealDOMElements([$("#cardinal-axis"), $('.sliders'), $(".sub-btns")], false);
        GFX.destroyElements(GFX.scene.root.children, "config");
        GFX.destroyElements(GFX.scene.root.children, "config-tmp");
        GFX.model.flags.ignore_collisions = false;
        $("#measure-opt-btn").find("i").html("add_circle_outline");
        $("#myCanvas").css("cursor", "default");
        $(".draggable").remove();
//        $("#cont-msg").empty();
        
        // remove helping grids
        for(var i = 0, node; node = GFX.scene.root.getNodesByName("grid")[i]; i++)
            node.destroy(); // remove help grid

        //remove active classes
        $(".on-point").removeClass("on-point");
        $("#tools-tab .btn.tool-btn").removeClass("pressed");
        
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
    },

    anotate: function( anotate )
    {
        if (anotate) {
            GFX.context.onmousedown = function(e) 
            {
                var ray = GFX.camera.getRay( e.canvasx, e.canvasy );
                if ( GFX.scene.testRay( ray, APP.result, undefined, 0x1, true ) )
                    $('#modalText').modal('show');
            }
        } 
        
        else
            GFX.context.onmousedown = function(e) {}
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
            APP.disableAllFeatures({no_msg: true});
            project.setRotations(GFX.model._rotation);
            project.save();
            putCanvasMessage({
                es: "¡Guardado!",
                cat: "Desat!",
                en: "Saved!"
            }, 4000, {type: "response"});
            
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
            putCanvasMessage({
                es: "La cofiguración de la escala ya se ha realizado antes",
                cat: "L'escala ja ha sigut configurada abans",
                en: "Scale set up before"
            }, 5000, {type: "alert"});    
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
                    vec3.copy( pos_first, nodes_used[0].getGlobalPosition() );
                    if(vec3.dist(pos_first, result) < 2)
                        result = pos_first;
                    
                    if(nodes_used.length > 1) // only when more than one to make the line between them
                        APP.addLine(nodes_used, {node_list: true});
                }
                
                var world_coord = vec3.create();
                vec3.copy( world_coord, result );
                
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
            vec3.copy( node_global_position, node.getGlobalPosition() );
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
            vec3.copy( node_global_position, node.getGlobalPosition() );
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
    }
}