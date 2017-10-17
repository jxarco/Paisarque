var project         = null;
var _dt             = 0.0;

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
        
        GFX.init(meshURL, textURL);
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
    
    go_orbit: function(element)
    {
        this.orbiting = !this.orbiting;

        if(this.orbiting)
            element.find("i").html("pause_circle_outline");
        else{
            element.find("i").html("play_circle_outline");
            element.removeClass("pressed");
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
            APP.set3DPoint();
            if(tmp.length == 2)
                 applyScale(tmp);
        }); 
        
        $("#help-dialog").click(function(){
            if($(".dialog-option.help").css("display") == "none")
                $(".dialog-option.help").fadeIn();
            else
                $(".dialog-option.help").fadeOut();
        });
        
        $("#add-dialog").click();
    },
    
    set3DPoint: function()
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
        }  
    },
    
    applyScale: function(point_list)
    {
        var scale = parseFloat($("#scale-input").val()) || 1;
        var relation = vec3.dist(point_list[0], point_list[1]) / scale;
        project.update_meter(relation);
        APP.disableAllFeatures();  // disabling here the mousedown event
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
        var rot_grid = new SceneIndication();
        rot_grid.grid(5);
        GFX.scene.root.addChild( rot_grid.node );
        
        // create grid
        var rot_grid = new SceneIndication();
        rot_grid.grid(5);
        GFX.scene.root.addChild( rot_grid.node );

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
    
    calcDistance: function ()
    {
        if(project._meter == -1){
            var msg = {
                es: "Falta configurar la escala",
                cat: "Primer has de configurar l'escala",
                en: "Set up the scale first"
            }
            putCanvasMessage(msg, 3000, {type: "error"});
            return;
        }
        // clear first and open dialog
        APP.disableAllFeatures();
        testDialog();
        // save points
        window.tmp = [];

        $("#add-dialog").click(function()
        {
            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");
            GFX.context.onmousedown = function(e) 
            {
                var result = vec3.create();
                var ray = GFX.camera.getRay( e.canvasx, e.canvasy );
                var node = GFX.scene.testRay( ray, result, undefined, 0x1, true );

                // set scene node if collision
                if (node) {
                    var ind = new SceneIndication({
                        scene: true,
                        position: result,
                        color: [0.3,0.8,0.1,1]
                    });
                    tmp.push(result);
                }
                // create line between points when possible
                if(tmp.length > 1)
                    APP.addLine(tmp);
            }
        });

        $("#end-dialog").click(function(){

            if(tmp.length < 2) 
                return;

            APP.disableAllFeatures(); //clear all
            
            var distance = 0; // add all distances
            for(var i = 0; i < tmp.length - 1; ++i)
                distance += vec3.dist(tmp[i], tmp[i+1]);
            
            distance /= project._meter;
            
            if(tmp.length == 2)
                project.insertMeasure(GFX.camera, tmp, distance, "nueva_dist", {display: true, push: true});
            else 
                project.insertSegmentMeasure(GFX.camera, tmp, distance, "nuevo_segs", {display: true, push: true});
        });
        
        // begin with an option selected
        $("#add-dialog").click();
    },

    calcArea: function (area_type)
    {
        if(project._meter == -1){
            var msg = {
                es: "Falta configurar la escala",
                cat: "Primer has de configurar l'escala",
                en: "Set up the scale first"
            }
            putCanvasMessage(msg, 3000, {type: "error"});
            return;
        }

        // clear first and open dialog
        APP.disableAllFeatures();
        testDialog();

        var msg = {
            es: "Añade puntos sobre el plano - El último debe coincidir el primero",
            cat: "Afegeix punts sobre el plà - El primer ha de coincidir amb l'últim",
            en: "Add points over the plane - First has to be same as last"
        }
        putCanvasMessage(msg, 4000);
        window.tmp = [];
        var index = area_type === PLANTA ? 1 : 2;

        $("#add-dialog").click(function(){ 

            selectDialogOption($(this));
            $("#myCanvas").css("cursor", "crosshair");

            GFX.context.onmousedown = function(e) 
            {
                var result = vec3.create();
                // normal depending on the type of area
                var normal = area_type === PLANTA ? vec3.fromValues(0, 1, 0) : vec3.fromValues(1, 0, 0);
                var ray = GFX.camera.getRay( e.canvasx, e.canvasy );
                var node = null;

                if(tmp.length)
                {
                    result = GFX.camera.getRayPlaneCollision( e.canvasx, e.canvasy, tmp[0], normal);
                    node = true;
                }
                else
                    node = GFX.scene.testRay( ray, result, undefined, 0x1, true );

                if(!node)
                    return;

                // adjust to same point if first point is too close
                if(tmp.length > 1)
                {
                    var units = vec3.dist(tmp[0], result);
                    if(units < 1.5)
                        result = tmp[0];            
                }
                tmp.push(result);
                
                if(tmp.length == 1) // create plane with first point only
                    APP.addAreaBase(tmp[0], area_type);
                else if(tmp.length > 1) // only when more than one to make the line between them
                    APP.addLine(tmp);
                
                var ind = new SceneIndication({
                    scene: true,
                    position: result,
                    color: [0.3,0.8,0.1,1],
//                        depth_test: false
                });
            }
        });

        $("#end-dialog").click(function(){

            if(tmp.length < 2)
                return;

            var points2D = [];
            var p2D = null;
            var points = tmp;
            var adds = 0;
            var subs = 0;
            
            APP.addLine(points);

            for(var i = 0; i < points.length; ++i)
            {
                // planta --> index = 1
                // alzado --> index = 2
                p2D = index == 1 ? vec2.fromValues(points[i][0], points[i][2]) : vec2.fromValues(points[i][1], points[i][2]);
                points2D.push(p2D);
            }

            for(var i = 0; i < points2D.length - 1; ++i)
            {
                var current = points2D[i];
                var next = points2D[i+1];
                adds += current[0] * next[1];
                subs += current[1] * next[0];
            }

            var area = Math.abs(0.5 * (adds - subs));
            area /= Math.pow(project._meter, 2);

            // passing 3d points list
            project.insertArea(points, area, index, "nueva_area", {display: true, push: true});
            //clear all
            APP.disableAllFeatures();
        });
        
        // begin with an option selected
        $("#add-dialog").click();
    },
    
    addLine: function(points, options)
    {
        options = options || {};
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
                scaling: 500,
                opacity: 0.35,
                name: "area-plane"
        });

        plane.description = "config";
        plane.render_priority = RD.PRIORITY_ALPHA;
        plane.blend_mode = RD.BLEND_ALPHA;
        plane.flags.two_sided = true;

        if(areaType === ALZADO)
            plane.rotate(90 * DEG2RAD, RD.FRONT);
        GFX.scene.root.addChild(plane);

        var grid_mesh = GL.Mesh.grid({size:10});
        GFX.renderer.meshes["grid"] = grid_mesh;

        var grid = new RD.SceneNode({
            mesh: "grid",
            position: basePoint,
            color: [0.5, 0.5, 0.5]
        });

        grid.description = "config";
        grid.primitive =gl.LINES;
        grid.scale([50, 50, 50]);    

        if(areaType === ALZADO)
            grid.rotate(90 * DEG2RAD, RD.FRONT);
        GFX.scene.root.addChild(grid);  
    },
    
    renderMeasure: function(o)
    {
        o = o || {};
    	var id = o.id;
    	var type = o.type;
    	var msr = null;

        // clear first
        GFX.destroyElements(GFX.scene.root.children, "config");// clear first
        
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
            ind = ind.ball(GFX.scene, points[i], {depth_test: false, type: "view"});    
        }    
        
        APP.addLine(points, {desc: "config"});

        // change global camera
        // to look at with smooth efect
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
        $("#measure-opt-btn").find("i").html("add_circle_outline");
        $("#myCanvas").css("cursor", "default");
        $(".draggable").remove();
        $("#cont-msg").empty();
        
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
        
        list.push($('#distances-table'));
        list.push($('#measure-btn'));
        list.push($('#segment-distances-table'));
        list.push($('#measure-s-btn'));
        list.push($('#areas-table'));
        list.push($('#measure-opt-btn'));

        revealDOMElements(list, false, {e: ""});
    }
}