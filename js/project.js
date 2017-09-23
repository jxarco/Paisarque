/**
* Project class to hold the project data
* @class Project
*/

var last_project_id         = 0;
var last_extra_id           = 0;
var last_measure_id         = 0;
var last_seg_measure_id     = 100;
var last_area_measure_id    = 1000;

function Project( data, user, flags )
{
	if(this.constructor !== Project)
		throw("You must use new to create a Project");
    if(!flags.no_construct)
	   this._ctor( data );
    this._user = user;
}

Project.prototype._ctor = function( data )
{
    this._anotations    = [];
    this._textures      = [];
    this._measures      = [];
    this._segments      = [];
    this._areas         = [];
    
	this.FROMJSON( data );
}

/*
*   @method pushExtra
*   Insert extra information to the _extra list.
*   @param type: data type (pdf, image, etc)
*   @param data: path to data (or link)
*/
Project.prototype.pushExtra = function( name, type, data )
{
    this._extra.push( {
        type: type,
        data: data,
        name: name
    });
}

/*
*   @method deleteExtra
*   Delete one single extra information of the _extra list.
*   @param type: data type (pdf, image, etc)
*   @param data: path to data (or link)
*/
Project.prototype.deleteExtra = function( selector, type )
{
    var index = null;
    var searched = null;
    
    if(type == "text"){
        searched = selector.attr("class").split(" ")[1];
    }
        
    else{
        searched = selector.attr("class").split(" ")[2];
    }
    
//    console.log(searched);
    
    for(var i = 0; i < this._extra.length; i++){
        if(this._extra[i].name == searched)
            var index = i;
    }
    
    if (index > -1) {
        this._extra.splice(index, 1);
    }
}

/*
*   @method rename
*   Renames project (ID!!)
*   @param name: new name
*/
Project.prototype.rename = function( name )
{
    var new_name = name.replace(/ /g, '_');
    new_name = new_name.charAt(0).toLowerCase() + string.slice(1);
    
	this._id = new_name;
}

/*
*   Anotations
*   @class Project
*/

/*
*   @method insertAnotation
*   @param camera: contains position, target and up
*   @param position: x y z of the anotation
*   @param status: text of the anotation
*/
Project.prototype.insertAnotation = function( id, camera, position, status )
{
    this._anotations.push({
        "id": id,
        "camera_position": camera.position,
        "camera_target": camera.target,
        "camera_up": camera.up,
        "text": status,
        "position": {
            "0": position[0],
            "1": position[1],
            "2": position[2],
        }
    });
    
    // fixing some bugs
    var c_position = vec3.fromValues(camera.position[0], camera.position[1], camera.position[2]);
    var c_target = vec3.fromValues(camera.target[0], camera.target[1], camera.target[2]);
    var c_up = vec3.fromValues(camera.up[0], camera.up[1], camera.up[2]);
    
    // se pone en el documento html y ademas que cuando se apreta a la anotacion se cambia a la camara con la que estaba
    var totalString = '<tr a id="' + id + '" draggable="true" ondragstart="drag(event)" onclick="lookAtAnot( camera, [' + c_position  + "], [" + c_target + "], [" + c_up + '], ' + id + ')">'+ "<td>" + id + "</td>" + "<td>" + status + "</td>"
    +"</tr>";
    
    $("#anotacion_tabla").append(totalString);
}

Project.prototype.getAnnotations = function()
{
    return this._anotations;
}

/*
*   @method deleteAnotation
*   Deletes a single annotation
*   @param id: id of the annotation to delete
*/
Project.prototype.deleteAnotation = function( id )
{
//    console.log("to delete: " + id);
//    console.log(this._anotations);
    
    //anotations list
    var index = null;
	for(var i = 0; i < this._anotations.length; ++i)
        if(this._anotations[i].id == id){
            index = i;
            break;
        }
                
         
    if(index === null)
        throw("no annotation to delete");
    
    //table
//    console.log($("#" + (index)));
//    console.log($("#" + (index+1)));
    $("#" + (index+1)).remove();
    
    // reorder table
    for(var i = index; i < this._anotations.length; ++i)
    {
        
        var rowindex = i + 1;
        var row = $("#" + rowindex);
        var sub = row.attr("id") - 1;
        
        if(!sub)
            continue;
        
        row.attr("id", sub);
        this._anotations[i].id = sub;
        
        // testing
        row = $("#" + sub);
        var tmp = row.html();
        tmp = tmp.replace("<td>" + (sub+1) + "</td>", "<td>" + sub + "</td>");
        row.html(tmp);
        //
    }
    
    // list
    this._anotations.splice(index, 1);
    
    // scene
    for(var i = 0; i < obj.children.length; ++i)
    if(obj.children[i].id == id)
    {
        obj.children[i].destroy();
        return;
    }
}

/*
*   @method deleteAllAnotations
*   Deletes all annotations
*   @param obj: current global mesh of the project
*/

Project.prototype.deleteAllAnotations = function( obj )
{
	// list
    this._anotations = [];
    // html
    $('#anotacion_tabla').empty();
    // scene
    obj.children.splice(0, obj.children.length);
}

/*
*  Rotations
*  @class Project
*/

Project.prototype.getRotations = function()
{
    return this._rotations;
}

/*
*   @method setRotations
*   Sets the current rotations to the project
*   @param rotation: array list of the object rotations
*/

Project.prototype.setRotations = function( rotation )
{
    var r0 = rotation[0];
    var r1 = rotation[1];
    var r2 = rotation[2];
    var r3 = rotation[3];
    
    this._rotations = [{"r0": r0},
        {"r1": r1},
        {"r2": r2},
        {"r3": r3}
    ];
}

/*
*   Distances
*   @class Project
*/

Project.prototype.getMeasurements = function()
{
    return this._measures;
}

Project.prototype.getSegmentMeasurements = function()
{
    return this._segments;
}

Project.prototype.getAreas = function()
{
    return this._areas;
}

Project.prototype.getMeasure = function(id)
{
    for(var i = 0; i < this._measures.length; i++)
        if(this._measures[i].id == id)
            return this._measures[i];
    return 0;
}

Project.prototype.getSegmentMeasure = function(id)
{
    for(var i = 0; i < this._segments.length; i++)
        if(this._segments[i].id == id)
            return this._segments[i];
    return 0;
}

Project.prototype.getArea = function(id)
{
    for(var i = 0; i < this._areas.length; i++)
        if(this._areas[i].id == id)
            return this._areas[i];
    return 0;
}

/*
*   @method deleteDistance
*   Delete one single measured distance from any of the 3 lists
*   @param id {number} id of the measure
*   @param type {string} data type (pdf, image, etc)
*/
Project.prototype.deleteDistance = function( id, type )
{
    var index = null;
    var list = null;
    
    switch(type){
        case "d": list = this._measures; break;
        case "s": list = this._segments; break;
        case "a": list = this._areas; break;
    }
    
    for(var i = 0; i < list.length; i++){
        if(list[i].id == id)
            index = i;
    }
    
    if (index > -1) {
        list.splice(index, 1);
    }
    else{
        console.error("bad index");
    }
}

/*  
*   @method setDistances
*   Insertar solo las medidas en las tablas
*   cuando se actualiza el metro
*   @param data
*/
Project.prototype.restoreDistances = function( )
{
    $('#distances-table').find("tbody").empty();
    $('#segment-distances-table').find("tbody").empty();
    $('#areas-table').find("tbody").empty();
    
    var length = this._measures.length;
    
    for(var i = 0; i < length; i++)
    {
        var msr = this._measures[i];
        
        var camera = {
            "position": msr.camera_position,
            "target": msr.camera_target,
            "up": msr.camera_up
        };
        
        var distance = msr.distance;
        this.insertMeasure(camera, msr.points, distance, {display: false, push: false, id: msr.id});
    }
    
    length = this._segments.length;
    
    for(var i = 0; i < length; i++)
        this.insertSegmentMeasure( this._segments[i].points, this._segments[i].distance, {display: false, push: false, id: this._segments[i].id} );
    
    length = this._areas.length;
    
    for(var i = 0; i < length; i++)
    {
        var points = [];
        var msr = this._areas[i];
        
        for(var j = 0; j < msr.points.length; j++)
        {
            var obj = msr.points[j];
            var point = [obj[0], obj[1], obj[2]];
            points.push(point);
        }
        this.insertArea( points, msr.area, msr.index, msr.name, {display: false, push: false, id: msr.id});    
    }
}

Project.prototype.update_meter = function(relation)
{
    // recalcular distancias 
    for(var i = 0; i < this._measures.length; ++i)
    {
        var msr = this._measures[i];
        msr.distance *= this._meter;
        msr.distance /= relation;
    }
    
    // recalcular segmentos
    for(var i = 0; i < this._segments.length; ++i)
    {
        var msr = this._segments[i];
        msr.distance *= this._meter;
        msr.distance /= relation;
    }
    
    // recalcular areas
    for(var i = 0; i < this._areas.length; ++i)
    {
        var msr = this._areas[i];
        msr.area *= Math.pow(this._meter, 2);
        msr.area /= Math.pow(relation, 2);
    }
    
    this._meter = relation;
    this.restoreDistances();
    this.save();
}

/*
*   @method insertMeasure
*   Push a new measure to the list project
*   @param camera: get camera properties
*   @param points: points within distance is calculated
*   @param options {object} push / display flags
*/

Project.prototype.insertMeasure = function( camera, points, distance, options )
{   
    if(!distance)
        return;
    
    options = options || {};
    
    var table = $('#distances-table');
    var bodyTable = table.find('tbody');
    var id = options.id >= 0 ? options.id : last_measure_id++;
    
    var row = "<tr id=" + id + " a class='pointer'>" + 
    "<td onclick='show($(this))' data-type='m'>" + "<i class='material-icons show'>fiber_manual_record</i></td>" +
    "<td>" + Math.round(distance * 1000) / 1000 + "</td>" + 
    "<td><i onclick='remove(this)' class='material-icons'>close</i></td>" + 
    "</tr>";
    
    bodyTable.append(row);
    
    showing["t1"] = options.display;
    revealDOMElements(table, options.display);
    
    if(options.push)
        this._measures.push( {
            "id": id,
            "camera_position": vec3.clone(camera.position),
            "camera_target": vec3.clone(camera.target),
            "camera_up": vec3.clone(camera.up),
            "points": points,
            "distance": distance
        });
}

/*
*   @method insertSegmentMeasure
*   Push a new segment measure to the list project
*   @param points: list of vertices
*   @param display: show or not the table after inserting measure
*/

Project.prototype.insertSegmentMeasure = function( points, distance, options )
{   
    if(!distance)
        return;
    
    options = options || {};
    
    var table = $('#segment-distances-table');
    var bodyTable = table.find('tbody');
     var id = options.id ? options.id : last_seg_measure_id++;
    
    var row = "<tr id=" + id + " a class='pointer'>" + 
    "<td onclick='show($(this))' data-type='s'>" + "<i class='material-icons show'>fiber_manual_record</i></td>" +
    "<td>" + (points.length - 1) + "</td>" + 
    "<td>" + Math.round(distance * 1000) / 1000 + "</td>" +
    "<td><i onclick='remove(this)' class='material-icons'>close</i></td>" + 
    "</tr>";
    
    bodyTable.append(row);
    
    showing["t2"] = options.display;
    revealDOMElements(table, options.display);
    
    if(options.push)
        this._segments.push( {
            "id": id,
            "points": points,
            "distance": distance
        } );
}

/*
*   @method insertArea
*   Push a new area measure to the list project
*   @param points: list of vertices
*   @param display: show or not the table after inserting measure
*/

Project.prototype.insertArea = function( points, area, index, name, options )
{   
    if(!area)
        return;
    
    options = options || {};
    
    var table = $('#areas-table');
    var bodyTable = table.find('tbody');
    var id = options.id ? options.id : last_area_measure_id++;
    var style = index === 1 ? "Planta" : "Alzado";
    
    var aux = "area-name" + id;
    
    var row = "<tr id=" + id + " a class='pointer'>" + 
    "<td onclick='show($(this))' data-type='a'>" + "<i class='material-icons show'>fiber_manual_record</i></td>" + 
    "<td id='" + aux + "'><p onclick='setInput(" + id + ")'>" + name + "</p></td>" + 
    "<td>" + style + "</td>" + 
    "<td>" + Math.round(area * 1000) / 1000 + "</td>" + 
    "<td><i onclick='remove(this)' class='material-icons'>close</i></td>" + 
    "</tr>";
    
    bodyTable.append(row);
    
    showing["t3"] = options.display;
    revealDOMElements(table, options.display);
    
    if(options.push)
        this._areas.push( {
            "id": id,
            "name": name,
            "points": points,
            "index": index,
            "area": area
        } );
}

/*
*   JSON
*   @class Project
*/

/*  
*   @method FROMJSON
*   Crear el proyecto a partir del json creado
*   @param data
*/
Project.prototype.FROMJSON = function( data )
{
    data = data || {};
    
    this._uid = last_project_id++;
    this._json = data;
    
	// data
	this._description = data.descripcion;
    this._id = data.id;
	this._author = data.autor;
    this._location = data.lugar;
    this._coordinates = data.coordenadas;
    
    this._render = data.render;
    
    this._mesh = data.render.mesh;
    
    for(var i = 0; i < data.render.texture.length; ++i)
        this._textures.push(data.render.texture[i]);    
    
    this._extra = data.extra;
    
    // anotations
    var len = data.anotaciones.length || 0;
    
    for(var i = 0; i < len; i++)
    {
        var cam = {
            "position": data.anotaciones[i].camera_position,
            "target": data.anotaciones[i].camera_target,
            "up": data.anotaciones[i].camera_up
        };
        
        this.insertAnotation( data.anotaciones[i].id, cam, data.anotaciones[i].position, data.anotaciones[i].text );
    }
    
    // rotations
    this._rotations = data.render.rotaciones || {};
    
    //distances
    this._meter = data.render.metro || -1;
    
    len = data.medidas ? data.medidas.length : 0;
    
    for(var i = 0; i < len; i++)
    {
        var camera = {
            "position": data.medidas[i].camera_position,
            "target": data.medidas[i].camera_target,
            "up": data.medidas[i].camera_up
        };
        
        var distance = data.medidas[i].distance;
        this.insertMeasure(camera, data.medidas[i].points, distance, {display: false, push: true});
    }
    
    len = data.segmentos ? data.segmentos.length : 0;
    
    for(var i = 0; i < len; i++)
        this.insertSegmentMeasure( data.segmentos[i].points, data.segmentos[i].distance, {display: false, push: true} );
    
    len = data.areas ? data.areas.length : 0;
    
    for(var i = 0; i < len; i++)
    {
        var points = [];
        for(var j = 0; j < data.areas[i].points.length; j++)
        {
            var obj = data.areas[i].points[j];
            var point = [obj[0], obj[1], obj[2]];
            points.push(point);
        }
        
        this.insertArea( points, data.areas[i].area, data.areas[i].index, data.areas[i].name, {display: false, push: true} ); 
    }
}

/*  
*   @method save
*   Guardar todos los datos a disco
*   Se trata de sobreescribir (o no) el json original,
*   con los atributos actuales del proyecto
*   @param overwrite
*   @param extra
*/
Project.prototype.save = function( overwrite, extra )
{
    overwrite = overwrite || true;
    extra = extra || "";
    
    var project = this._user + "/" + this._id;
    
    if(!overwrite)
        project += extra;
    
    var path = "data/" + project + '.json';
    
    console.log(path);
    
    var json = {
        "id": this._id,
        "descripcion": this._description,
        "autor": this._author,
        "lugar": this._location,
        "coordenadas": {"lat": this._coordinates.lat, "lng": this._coordinates.lng},
        "render":{"id": this._id, "mesh": this._mesh, "texture": this._textures,
                  "rotaciones": this._rotations, "metro": this._meter},
        "extra": this._extra,
        "anotaciones": this._anotations,
        "medidas": this._measures,
        "segmentos": this._segments,
        "areas": this._areas
    };
        
    $.ajax({
            type: "POST",
            //dataType : 'json',
            url: 'save_to_disc.php',
            data: { 
                data: JSON.stringify(json),
                file: path
            },
            succes: function(response){
                console.log("SAVED!!");
            },
            error: function(error){
//                console.log("error");
                console.log(error);
            }
    });
}


/*  
*   @method check
*   Cambiamos propiedades de la página dependiendo de 
*   atributos del proyecto
*/
Project.prototype.check = function()
{
    if(this._meter !== -1)
        $(".measures-btns").css('opacity', '1');
    
    if(this._description !== "nodesc")
        $(".pro-info").val(this._description);
    
    // coordinates
    $("#lat").val(this._coordinates.lat);
    $("#lon").val(this._coordinates.lng);
}


/*  
*   @method fill
*   Crea un proyecto a partir de un string con los datos
*   @param data
*/
Project.prototype.fill = function( data )
{
//    console.log(data);
    var copy = JSON.parse(data);
    
//    this._json = copy._json;
    this._id = copy._id;
    this._uid = copy._uid;
    this._description = copy._description;
    this._author = copy._author;
    this._location = copy._location;
    this._coordinates = copy._coordinates;
    this._render = copy._render;
    this._rotations = copy._rotations;
    this._mesh = copy._mesh;
    this._textures = copy._textures;
    this._anotations = copy._anotations;
    
    this._extra = copy._extra;
    this._meter = copy._meter;
    this._measures = copy._measures;
    this._segments = copy._segments;
    this._areas = copy._areas;
}

Project.prototype.delete = function()
{
    /*  
    *   Vaciar proyecto para cuando se hace logout o 
    *   se cambia de proyecto
    */
    
    
}
