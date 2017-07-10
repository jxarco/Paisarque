<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PaisArque Application</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/custom.min.css" rel="stylesheet">
    <link href="css/estilo.css" rel="stylesheet">
        
    </head>
    <body class="container">
        
        <header class="row"><div class="col-lg-12">
            
                <nav class="navbar navbar-default"><div class="container-fluid">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                          <span class="sr-only">Toggle navigation</span>
                          <span class="icon-bar"></span>
                          <span class="icon-bar"></span>
                          <span class="icon-bar"></span>
                        </button>
                        <a class="navbar-brand" href="index.html">PaisArque</a>
                    </div>
                    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav">
                        <li> <a onclick="location.href='index.html'">   Login </a> </li>
                        <li> <a onclick="location.href='form.php'"> Form</a> </li>
                        <li> <a onclick="location.href='ayudaForm.html'">  Ayuda </a> </li>
                    </ul></div>
                </div></nav>
            
        </div></header><!--   header end-->
        
        
        <!--Formulario para el registro-->
        <content class="container">
            <div class="row">
                <div class="col-lg-8" style="width:100%">
                    <div class="well">
                        <form class="form-horizontal" method="post" role="form" action="form.php" id="formRegister">
                            <fieldset>
                                <legend>Información de contacto</legend>
                                <div class="form-group">
                                    <label for="username" class="col-lg-2 control-label">Usuario</label>
                                    <div class="col-lg-10">
                                        <input type="text" class="form-control" id="username" placeholder="Usuario" name="username">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="name" class="col-lg-2 control-label">Nombre</label>
                                    <div class="col-lg-10">
                                        <input type="text" class="form-control" id="name" placeholder="Nombre" name="name">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="lastname" class="col-lg-2 control-label">Apellido</label>
                                    <div class="col-lg-10">
                                        <input type="text" class="form-control" id="lastname" name="lastname" placeholder="Apellido">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="email" class="col-lg-2 control-label">Email</label>
                                    <div class="col-lg-10">
                                        <input type="email" class="form-control" id="email" name="email" placeholder="Email">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="password" class="col-lg-2 control-label">Password</label>
                                    <div class="col-lg-10">
                                        <input type="password" class="form-control" id="password" name="password" placeholder="Password">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="afiliacion" class="col-lg-2 control-label">Afiliación académica</label>
                                    <div class="col-lg-10">
                                        <input type="text" class="form-control" id="afiliacion" name="afiliacion" placeholder="Afiliación académica">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="uso" class="col-lg-2 control-label">Uso principal APP</label>
                                    <div class="col-lg-10">
                                        <select class="form-control" id="uso" name="uso">
                                            <option>Personal</option>
                                            <option>Académico</option>
                                            <option>Profesional</option>
                                        </select>
                                    </div>
                                </div>
                                <br>
                                <div class="form-group">
                                    <label for="disclaimer" class="col-lg-2 control-label"></label>
                                    <div class="col-lg-10">
                                        <span class="text">No divulgaré proyectos marcados como privados</span>
                                        <div class="checkbox">
                                        <label> <input type="checkbox" id="disclaimer" name="disclaimer">Acepto</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-lg-10 col-lg-offset-2">
                                        <button type="reset" class="btn btn-default">Cancel</button>
                                        <button type="submit" name="submit" value="send" class="btn btn-primary" >Submit</button>
                                    </div>
                                </div>
                            </fieldset>
                            <div class="form-group">
                                    <div class="col-lg-10 col-lg-offset-2">
                                    </div>
                            </div>
                        </form>
                    </div>
                </div>  
            </div>
        
        </content> 
        
        <footer>
        
        </footer> 
            

        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <!-- Include all compiled plugins (below), or include individual files as needed -->
        <script src="js/extra/bootstrap.min.js"></script>
        <script src="js/extra/custom.js"></script>
        
        <script type="text/javascript" src="js/extra/gl-matrix-min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script src="js/tools.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
    </body>
    
</html>