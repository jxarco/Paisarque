<?php
    
    // Recuperar sesión
    session_start(); 
    
    if(!isset($_SESSION['current']))
        echo "sesion perdida";
    else
        echo "DEBUG : sesion activa (" . $_SESSION['current'] . ")";
?>


<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>PaisArque Application</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link href="css/custom.min.css" rel="stylesheet">
    <link href="css/estilo.css" rel="stylesheet">
    <link href="css/verticalText.css" rel="stylesheet">


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
<!--                        <a class="navbar-brand" href="index.html">PaisArque</a>-->
                        <a class="navbar-brand">PaisArque</a>
                    </div>
                    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav">
                        <li> <a onclick="<?php echo "location.href = 'inicio.php?user=" . $_SESSION['current'] . "'"; ?>"> Inicio</a> </li>
                        <li> <a onclick="loadContent('modelo.php')"> Modelo 3D</a> </li>
                        <li> <a onclick="loadContent('infoextra.php')">   Info Extra </a> </li>
                        <li> <a onclick="loadContent('exportar.php')">   Exportar </a> </li>
                        <li> <a onclick="loadContent('ayuda.php')">  Ayuda </a> </li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right">
                        <li class="logged-button"><a href="#" id="textUser"></a></li>
                        <li id="logout" class="logout-button pointer"><a>
                            <span class="glyphicon glyphicon-off" aria-hidden="true">
                            </span></a></li>
                    </ul></div>
                </div></nav>
            
        </div></header><!--   header end-->
        
        <content class="container">
            
            <div class="col-sm-12 text-left" id="placeholder"> 
            <!--<div id="placeholder" class="col-lg-12 well">-->
                <div class="col-sm-9 text-left" id= "myCanvas"></div>
                
                <div class="col-sm-3" id="tools">
                    <ul  class="nav nav-tabs">
                        <li class="active"><a href="#info" data-toggle="tab" aria-expanded="true">Info</a></li>
                        <li> <a href="#herramientas" data-toggle="tab" aria-expanded="true">Tools</a> </li>
                        <li> <a href="#anotaciones" data-toggle="tab" aria-expanded="true">Anotaciones</a> </li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade active in" id="info">
                            <div id="descripcion">
                                <label for="comment">Descripción:</label>
                                <textarea style="width:200px;height:100px; resize: none;" class="form-control" rows="5" id="comment"></textarea>
                            </div>
                            <br>
                            <div id="map" style="width:200px;height:200px;"></div>
                        </div>
                        <div class="tab-pane fade" id="herramientas">
                            <a onclick="" class="btn btn-default tool-btn" id="viz_on"><i class="material-icons">visibility</i></a>
                            <a onclick="" class="btn btn-default tool-btn" id ="add_size"><i class="material-icons">add</i></a></a>
                            <a onclick="" class="btn btn-default tool-btn" id ="subs_size"><i class="material-icons">remove</i></a></a>
                            <a onclick="medirMetro()" class="btn btn-default tool-btn">Configurar herramienta de medición</a>
                        </div>
                        <div class="tab-pane fade" id="anotaciones">
                            <div class="modal fade" id="modalText" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                              <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Anotación</h5>
                                  </div>
                                  <div class="modal-body">
                                    <form>
                                      <div class="form-group">
                                        <textarea class="form-control" style="resize:none;" id="message-text"></textarea>
                                      </div>
                                    </form>
                                  </div>
                                  <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="saveTextButton">Save</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <a onclick="anotar(true)" class="btn btn-default" id="actAnot">Activar Modo Anotación</a>
                            <a onclick="anotar(false)" class="btn btn-default" visibility="hidden" id ="desAnot">Desactivar Modo Anotación</a>
                            <table class="table table-striped table-hover ">
                                <thead>
                                    <tr>
                                    <th>#</th>
                                    <!--<th>Posición</th>-->
                                    <th>Comentario</th>
                                    </tr>
                                </thead>
                                <tbody id="anotacion_tabla"></tbody>
                            </table>
                            <a onclick="saveAnotations()" class="btn btn-default">Guardar anotaciones en el servidor</a>
                            <a onclick="borrarAnotaciones()" class="btn btn-default">Borrar anotaciones</a>
                        </div>
                    </div>
                </div>
                
            </div>
        </content><!--  content end-->
        
        <footer>
        
        </footer><!--   footer end-->
            
        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <!-- Include all compiled plugins (below), or include individual files as needed -->
        <script src="js/extra/bootstrap.min.js"></script>
        <script src="js/extra/custom.js"></script>
        
        <script type="text/javascript" src="js/extra/gl-matrix-min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script src="js/tools.js"></script>
        <script src="js/app.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDrcNsufDO4FEmzoCO9X63ru59CUvCe2YI&callback=initMap" type="text/javascript"></script>
        
    </body>
    
</html>