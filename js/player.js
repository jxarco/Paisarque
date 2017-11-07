var project = null;

var PLAYER = {
    
    init: function(){
        
        // get project to connect player from url
        var full_project = QueryString["p"];
        
        // load JSON info
        this.FROM_JSON( full_project );
    },
    
    play: function( meshURL, textURL ){
        
        var that = this;
        
        that.createOptions();
            
        // finish and run GFX stuff
        GFX.init( meshURL, textURL );
    },
    
    createOptions: function(){
      
        var dialog = new LiteGUI.Dialog( "player-dialog", {parent: "body", title: project._id, minimize: true, width: 250, height: 500, draggable: true});
        dialog.setPosition(10, 116);
        dialog.show('fade');
        
        //tabs 
        var tabs_widget = new LiteGUI.Tabs("paneltab", {size: "full"});
        tabs_widget.addTab("Info", {size: "full"});
        tabs_widget.addTab("3D",{selected:true, size: "full"});
        
        dialog.add( tabs_widget );
        
        var info_widgets = new LiteGUI.Inspector("Inspector_info", {width: "100%"});
        
        info_widgets.addInfo( "User", project._user );
        info_widgets.addInfo( "Author", project._author );
        info_widgets.addInfo( "Location", project._location );
        
        tabs_widget.getTabContent( "Info" ).appendChild( info_widgets.root );
        
        var tools_widgets = new LiteGUI.Inspector("Inspector_info", {width: "100%"});
        
        tools_widgets.addSeparator();
        
        tools_widgets.addButton(null, "Full screen", { width: "100%",  callback: function(){
            GFX.goFullscreen();
        }});
        
        tools_widgets.addButton(null, "Reset camera", { width: "100%",  callback: function(){
            GFX.camera.direction = [150,60,150];
            GFX.camera.smooth = true;
        }});
        
        tools_widgets.addSeparator();
        
        tools_widgets.addNumber( "Orbit", 0, { width: "100%",  callback: function(v){
            GFX.orbit_speed = v * 0.001;
        }, min: -10, max: 10, step: 0.1});
        
        tools_widgets.addSection( "Export", {className: "export-section"});
        
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
        tools_widgets.addButton( "Image", "Capture", { width: "100%", callback: function(){
            GFX.takeSnapshot();
        }});
        tools_widgets.addButton( "Video", "Record",{width: "100%", callback: function(v) {        
            GFX.record_orbit();
        }});
        
        tools_widgets.addSeparator();

        var table = new LiteGUI.Table({scrollable:true});
        tools_widgets.append( table.root );
        table.setColumns(["id","text"]);
        
        var data = [];
        
        for(var i = 0; i < project._anotations.length; ++i){

            var anot = project._anotations[i];
            data.push( {
                id: anot.id,
                text: anot.text
            });
        }
        
        table.setRows( data, true );
        
        tools_widgets.addSeparator();
        tabs_widget.getTabContent( "3D" ).appendChild( tools_widgets.root );
    },
    
    FROM_JSON: function( full_project )
    {
        var user = full_project.split("/")[0];
        var project = full_project.split("/")[1];

        $.ajax({
            dataType: "json",
            url: "litefile/files/" + user + "/projects/" + project  + '.json',
            success: function( data )
            {
                // GET PROJECT DATA
                PLAYER.PARSE_JSON(data, user);
            },
            error: function(err)
            {
                console.error(err)
            }
        });
    },
    
    PARSE_JSON: function( json, user )
    {
        if(project === null)
            project = new Project( json, user, {no_construct: false} );

        /****************************************************************/
        /* render stuff*/

        var renderData = project._render;
        if(!renderData.mesh) {
            console.error("There is no mesh");
            return;
        }

        var root = "litefile/files/" + user + "/projects/";
        var meshURL = root + renderData.mesh;
        var textURL = root + renderData.texture;
        
        this.play( meshURL, textURL );
    }
}