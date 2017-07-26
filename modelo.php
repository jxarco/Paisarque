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
    <link href="css/rangeslider.css" rel="stylesheet">

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
                <div class="sliders">
                    <div class="slider">
                        <p style="color:white;">X </p>
                        <input id="s1" type="range" value="0" step="0.01" min="-6.5" max="6.5">
                    </div>
                    <div class="slider">
                        <p style="color:white;">Y </p>
                        <input id="s2" type="range" value="0" step="0.01" min="-6.5" max="6.5">
                    </div>
                    <div class="slider">
                        <p style="color:white;">Z </p>
                        <input id="s3" type="range" value="0" step="0.01" min="-6.5" max="6.5">
                    </div>
                </div>
                <img id="cardinal-axis" src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Br%C3%BAjula.svg/300px-Br%C3%BAjula.svg.png">
                
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
                                <textarea style="width:250px;height:100px; resize: none;" class="form-control" rows="5" id="comment"></textarea>
                            </div>
                            <br>
                            <div id="map"></div>
                        </div>
                        <div class="tab-pane fade" id="herramientas">
                            
                            <div class="tools-btns project">
                                <p class="delimiter">PROJECT</p>
                                <a onclick="enableSetRotation()" class="btn tool-btn">
                                    <div class="info_hover_box">Configurar rotaciones por defecto</div>
                                    <i class="material-icons">3d_rotation</i>
                                </a>

                                <a id="test" class="btn tool-btn">
                                    <div class="info_hover_box">Guardar cambios del proyecto</div>
                                    <i class="material-icons">save</i>
                                </a>
                            </div>
                            
                            <div class="tools-btns anot">    
                                <p class="delimiter">DISTANCIAS</p>
                                
                                <a onclick="medirMetro()" class="btn tool-btn">
                                    <div class="info_hover_box">Definir un metro</div>
                                    <i class="material-icons">settings</i>
                                </a>
<!--
                                <a onclick="changeSizeAnotInCanvas(true)" class="btn tool-btn" id ="add_size">
                                    <div class="info_hover_box">Bigger anotations</div>
                                    <i class="material-icons">add</i>
                                </a>
                                <a onclick="changeSizeAnotInCanvas(false)" class="btn tool-btn" id ="subs_size">
                                    <div class="info_hover_box">Smaller anotations</div>
                                    <i class="material-icons">remove</i>
                                </a>
-->
                                <a id="measure-btn" onclick="medirDistancia()" class="btn tool-btn nodisplay">
                                    <div class="info_hover_box">Configura el metro antes de medir</div>
                                    <i class="material-icons">space_bar</i>
                                </a>
                                <a id="show_dt" class="btn tool-btn">
                                    <div class="info_hover_box">Mostrar distancias medidas</div>
                                    <i class="material-icons">reorder</i>
                                </a>
                            </div> 
                                
                            <table class="table table-striped table-hover" id="distances-table">
                                 <thead>
                                    <tr>
                                        <th>P1</th>
                                        <th>P2</th>
                                        <th>Dist (metros)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                            
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
                            
                            <a class="btn tool-btn" id="viz_on">
                                    <div class="info_hover_box">Esconder anotaciones</div>
                                    <i class="material-icons">visibility_off</i>
                            </a>
                            
                            <a onclick="anotar(true)" class="btn tool-btn" id="actAnot">
                                    <div class="info_hover_box">Activar Modo Anotación</div>
                                    <i class="material-icons">create</i>
                            </a>
                            
                            <a onclick="anotar(false)" class="btn tool-btn nodisplay" id="desAnot">
                                    <div class="info_hover_box">Desactivar Modo Anotación</div>
                                    <i class="material-icons">remove_circle</i>
                            </a>
                            
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
                            
                            <div id="deleting-div">
                                <a class="btn tool-btn" id="delete-anot-btn">
                                    <div class="info_hover_box">Borrar todas las anotaciones</div>
                                    <i class="material-icons">delete</i>
                                </a>

                                <div id="drag-cont" ondrop="drop(event)" ondragleave="disallowDrop()" ondragover="allowDrop(event)">
                                    Arrastra aquí para borrar una sola anotación
                                </div>
                            </div>
                            
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
        <script type="text/javascript" src="js/extra/rangeslider.min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
        <script src="js/project.js"></script>
        <script src="js/utils.js"></script>
        <script src="js/tools.js"></script>
        <script src="js/app.js"></script>
        <script src="js/events.js"></script>
    </body>
    
</html>