var session = null;
var system_info = {};
var filesview_mode = "thumbnails";
var units = {};
var current_unit = "";
var current_folder = "";
var current_file_item = null;;


// se ensena el dialogo de que se esta cargando
$(".startup-dialog").show();

// se esconde el dialogo para acceder
$("#loginForm").hide();

LiteFileServer.setup("", function(status, resp) {
    console.warn("Server checked");
    $(".startup-dialog").hide();
    if(status == 1)
    {
        system_info = resp.info;
        console.warn("Server ready");
        systemReady();

        if(localStorage.session && session === null)
        {
            var last_session_opened = JSON.parse(localStorage.session);
            window.location.href = "inicio";
        }
    }
    else
    {
        console.warn("Server not ready");
        if(status == -10)
            $(".warning-dialog .content").html("LiteFileServer config file not configured, please, check the <strong>config.sample.php</strong> file in includes and after configure it change the name to <strong>config.php</strong>.");
        else
            $(".warning-dialog .content").html("LiteFileServer database not found, please run the <a href='install.php'>install.php</a>.");
        $(".warning-dialog").show();
    }
});

//LOGOUT
$(".logout-button").click( function(e) {

    session.logout();
    localStorage.clear();
    window.location.href = "index";
});

function systemReady()
{    
	//LOGIN
    $(".startup-dialog").hide();
    //start up
    $("#loginForm").show();
    
    $(".form-signin").submit( function(e) {
		var values = getFormValues(this);
        
		e.preventDefault();

		//store in the login form so he can see it if he logs out
		$("#inputEmail").val( values["username"] );
		$("#inputPassword").val( values["password"] );

		LiteFileServer.login( values["username"], values["password"], function(session, result){
            
            // si el login es correcto, se entra y se va a la url de inicio
			if( session.status == LiteFileServer.LOGGED ) {
				onLoggedIn(session);
                console.log(session);
                localStorage.setItem('session', JSON.stringify(session));
                window.location.href = "inicio";
            }
			else
				throw("error login in");

		});
	});
    
    //FORGOT PASSWORD
	var forgotpassword_button = Ladda.create( $(".form-forgot .forgotpasswordsend-button")[0] );
	$(".form-forgot").submit( function(e) {
		$(this).css("opacity",0.5);
		forgotpassword_button.start();
		var values = getFormValues(this);
		e.preventDefault();
        
        var that = this;

		//ask to send email
		LiteFileServer.forgotPassword( values["username"], function( v, result ){
			forgotpassword_button.stop();
			$(".form-forgot").css("opacity",1);
			bootbox.alert(result.msg);
            
            $(".modal-backdrop").css("z-index", "-1");
            $(".modal-dialog").css("z-index", "10");
            
            $(that).trigger("reset");
            
		} , window.location.origin + window.location.pathname );
	});

	//RESET PASSWORD
	var confirm_resetnewpassword_button = Ladda.create( $("#resetpassword-dialog .confirm-resetnewpassword-button")[0] );
	$(".form-resetpass").submit( function(e) {

		if(!session)
			return;

		$(this).css("opacity",0.5);
		confirm_resetnewpassword_button.start();
		var values = getFormValues(this);
		console.log(values);
		e.preventDefault();

		session.setPassword( values["old_password"], values["new_password"], function( v, result ){
			confirm_resetnewpassword_button.stop();
			$(".form-forgot").css("opacity",1);
			bootbox.alert(result.msg);
		});
	});

	//CHANGE PASS
	var confirm_changepassword_button = Ladda.create( $("#changepassword-dialog .confirm-changepassword-button")[0] );
	$(".form-changepass").submit( function(e) {

		if(!session)
			return;

		$(this).css("opacity",0.5);
		confirm_changepassword_button.start();
		var values = getFormValues(this);
		console.log(values);
		e.preventDefault();

		session.setPassword( values["old_password"], values["new_password"], function( v, result ){
			confirm_changepassword_button.stop();
			$(".form-forgot").css("opacity",1);
			bootbox.alert(result.msg);
		});
	});
    
    
    if(session)
    {
        var sessionTry = JSON.parse(localStorage.getItem('session'));
        var user = sessionTry["user"];
        $(".textUser").html(user["username"]);
        $(".textUser").append('<span style="margin-left: 10px;" class="glyphicon glyphicon-user"></span>');
    }
    
     $("#formRegister").on('submit', function(e) {
        
        e.preventDefault();

        //Cogemos los valores y quitamos el comportamiento por defecto del botón submit
        var values = getFormValues(this);

        //Si no se han rellenado los valores, mostramos un alert
        if(!values["username"] || !values["password"] || !values["email"] || !$('#disclaimer').prop('checked') || !values['afiliacion']) 
        {
            window.alert("Fill all the fields");
            return;
        }  
        
        var valuesData = {Nombre: values["name"], Apellidos: values["lastname"], Afiliacion: values["afiliacion"], Uso: values["uso"]};
         
        var valuesString = JSON.stringify(valuesData);
         
        //Llamamos a la función para crear la cuenta
        //@Param: username
        //@Param: password
        //@Param: on_create --> callback(created [bool], resp[respuesta - mensaje de status])
        //@Param: on_error
        //@Param: session
        //@Param: el resto de los valores que le quieres pasar
        LiteFileServer.createAccount( values["username"], values["password"], values["email"], function(created, resp){   
   
            if(created)
            {
                window.alert("Usuario creado");
                
                // login as admin to change user space
//                LiteFileServer.login( "admin", "", function(session, result){
//                    if( session.status == LiteFileServer.LOGGED ) {
                
//                    }
//                    else
//                        throw("error login in (admin)");
//                    
//                    session.logout();
//                });
                
                LiteFileServer.login( values["username"], values["password"], function(session, result){
            
                    // si el login es correcto, se entra y se va a la url de inicio
                    if( session.status == LiteFileServer.LOGGED ) {
                        onLoggedIn(session);
                        console.log(session);
                        localStorage.setItem('session', JSON.stringify(session));
                        
//                        session.
                        
                        var fullpath = session.user.username;
                        session.createFolder(fullpath);
                        
                        fullpath += "/projects/";
                        session.createFolder(fullpath);
                        
                        window.location.href = "inicio";
                    }
                    else
                        throw("error login in");
                });
                
                
                
            } 
        } ,null, session ? session.token : null, valuesString);
        
        return false;
    
    });
    
}

function copySession(newSession, previousSession) {
    
    newSession.setToken(previousSession.token);
    delete newSession.onsessionexpired;
    newSession.server_url = previousSession.server_url;
    newSession.status = previousSession.status;
    newSession.user = previousSession.user;
    newSession.units = previousSession.units;
    newSession.last_resp = previousSession.last_resp;
    
    return newSession;
}

function onLoggedIn(session)
{
	//save session
	window.session = session;
	window.session.onsessionexpired = onSessionExpired;

	refreshUserInfo( session.user );

	/*if( QueryString["action"] == "reset")
	{
		$('#inputResetOldPassword').val(QueryString["pass"]);
		$('#inputResetNewPassword').val("");
		$('#resetpassword-dialog').modal('show');
	}*/
}


function onSessionExpired()
{
	session = null;
	bootbox.alert("Session expired");
}

function refreshUserInfo( user )
{
	session.user = user;
	var f = user.used_space / user.total_space;
	/*$(".quota").find(".progress-bar").css("width", ((f * 100)|0) + "%");
	$(".quota").find(".progress-bar .size").html( LFS.getSizeString(user.used_space) );
	$(".profile-username").html( user.username );*/
}

function getFormValues(form)
{
	var values = {};
    
	$.each( $(form).serializeArray(), function(i, field) {
		values[field.name] = field.value;
	});
	return values;
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

$(document).ready(function() {
    
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
})