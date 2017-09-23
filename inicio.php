<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

        <title>PaisArque Application</title>
        <link rel="icon" href="http://icons.iconarchive.com/icons/icons8/windows-8/512/City-Archeology-icon.png">    
        <!-- Bootstrap -->
        <link href="css/bootstrap.min.css" rel="stylesheet">
        <link href="css/custom.min.css" rel="stylesheet">
        <link href="css/estilo.css" rel="stylesheet">
        <link href="css/header.css" rel="stylesheet">
        <link rel="stylesheet" href="css/RWD.css"> <!-- responsive web design -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
        <link href="https://fonts.googleapis.com/css?family=Lobster" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">        
    </head>
    <body>
        
        <!-- Navbar -->
        <div class="w3-top">
          <div class="w3-bar w3-card-2">
            <a id="megatitle" class="w3-bar-item w3-button w3-padding-large">PaisArque</a>
            <a class="w3-bar-item w3-button w3-right w3-padding-large logout-button"><span class="glyphicon glyphicon-off" aria-hidden="true"></span></a>
            <a class="w3-bar-item w3-button w3-right w3-padding-large textUser">username</a>
          </div>
        </div>
        
        <content class="container" id="all">
            
            <div class="row" style="margin-top: 46px;">
                <div class="col-md-6 col-md-offset-3">
                    <div class="panel panel-default">
                        <div class="panel-body">
                            
                            <button id="addProject" class="submit-button btn table-btn btn-lg btn-block ladda-button" data-style="slide-up" data-color="green" type="submit" data-toggle="modal" data-target="#GSCCModal"><span class="ladda-label">Crear nuevo proyecto</span><span class="ladda-spinner"></span></button>
                            <button id="delete-project" class="submit-button btn table-btn btn-lg btn-block ladda-button" data-style="slide-up" data-color="green" type="submit"><span class="ladda-label">Eliminar proyecto existente</span><span class="ladda-spinner"></span></button>
                            
                            <!-- Listamos los ficheros que hay en el servidor/carpeta y sus propiedades -->
                            <table id="projects-tb" class="table table-striped table-hover ">
                                <thead>
                                    <tr>
                                        <th>Nombre proyecto</th>
                                        <th>Autor proyecto</th>
                                        <th>Lugar</th>
                                    </tr>
                                </thead>
                                <tbody id="tableInicio">
                                    <!-- Esto es necesario para saber cuantos JSON hay y hacer una lista de ellos para luego acceder al modelo -->
                                    <?php                                         
                                        $directory = "data/" . $_GET['user'] ."/";

                                        $filecount = 0;
                                        $files = glob($directory . "*.{json}",GLOB_BRACE);

                                        if ($files){
                                            $filecount = count($files);
                                        }

                                        for ($i = 0; $i < $filecount; $i = $i+1) {

                                            $user = substr(substr($files[$i], 5),0, -5);
                                            $username = $_GET['user'];
                                            $project = substr($user, strlen($username) + 1, strlen($user));

                                            echo '<tr a class="pointer" id="' . $project . '" onclick' . '=' . '"loadContent(' . "'modelo.html','";
                                            echo $user;
                                            echo "')" . '"' . ">" . "<td>";
                                            echo str_replace('_', ' ', ucfirst($project))  . "</td>" . "<td>";

                                            $string = file_get_contents($files[$i]);
                                            $json_a = json_decode($string, true);

                                            foreach ($json_a as $k => $v) {
                                                if ($k == "autor")
                                                    echo $v;
                                            }

                                            echo "</td>" . "<td>";

                                            foreach ($json_a as $k => $v) {
                                                if ($k == "lugar")
                                                    echo $v;
                                            }

                                            echo "</td>" . "</tr>". "<br>";

                                        }
                                    ?>
                                </tbody>
                            </table> 
                            
                        </div>
                    </div>
                    
                    <img src="data/bbva.png" class="img-responsive" style="margin-left: calc(50% - 50px); width: 100px;">
                        
                </div>
	       </div>
            
            
            <div class="modal" id="loadingModal" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h4 class="modal-title">Subiendo archivos al servidor</h4>
                        </div>
                        <div class="modal-body">
                            <div class="progress progress-striped active">
                                <div class="progress-bar" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div id="GSCCModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
             <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;  </button>
                    <h4 class="modal-title" id="myModalLabel">Cargar proyecto</h4>
                  </div>
                  <div class="modal-body" id="idModalBody">
                      <form class="form-horizontal" id="formUploadProject" method="POST" role="form" enctype="multipart/form-data">
                        <fieldset id="fieldset">
                            <div class="form-group">
                                <label for="idProyecto" class="col-lg-2 control-label">Nombre</label>
                                <div class="col-lg-10">
                                    <input type="text" class="form-control" id="idProyecto" placeholder="Nombre del proyecto" name="idProyecto">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="autor" class="col-lg-2 control-label">Autor</label>
                                <div class="col-lg-10">
                                    <input type="text" class="form-control" id="autor" placeholder="Autor" name="autor">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="lugar" class="col-lg-2 control-label">Lugar</label>
                                <div class="col-lg-10">
                                    <input type="text" class="form-control" id="lugar" placeholder="Lugar" name="lugar">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="latitud" class="col-lg-2 control-label">Latitud</label>
                                <div class="col-lg-10">
                                    <input  type="number" step="any"  class="form-control" id="latitud" name="latitud" placeholder="Latitud">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="longitud" class="col-lg-2 control-label">Longitud</label>
                                <div class="col-lg-10">
                                    <input  type="number" step="any" class="form-control" id="longitud" name="longitud" 
                                    placeholder="Longitud">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="mesh" class="col-lg-2 control-label">Mesh</label>
                                <div class="col-lg-10">
                                    <input type="file" class="form-control" id="mesh" name="mesh">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="textura" class="col-lg-2 control-label">Textura</label>
                                <div class="col-lg-10">
                                    <input type="file" class="form-control" id="textura" name="texture" accept="image/*">
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-lg-10 text-center"> 
                                    <button id="buttonYoutubeLink" type="button" class="btn btn-default addExtraData">
                                        <i class="material-icons">add_circle_outline</i> <p>Youtube Link</p> </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-lg-10 text-center"> 
                                    <button id="buttonPDFLink" type="button" class="btn btn-default addExtraData">
                                        <i class="material-icons">add_circle_outline</i> <p>PDF</p> </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-lg-10 text-center"> 
                                    <button id="buttonImageLink" type="button" class="btn btn-default addExtraData">
                                        <i class="material-icons">add_circle_outline</i> <p>Imagen</p> </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-lg-10 text-center"> 
                                    <button id="buttonTextLink" type="button" class="btn btn-default addExtraData">
                                        <i class="material-icons">add_circle_outline</i> <p>Texto</p> </button>
                                </div>
                            </div>
                            
                        </fieldset>
                        <div class="modal-footer">
                            <div class="form-group">
                                <div class="col-lg-10 col-lg-offset-2">
                                     <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                                    <button type="submit" name="submit" value="send" class="btn btn-primary" >Submit</button>
                                </div>
                            </div>
                        </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

        </content><!--  content end-->
        
        <footer>
        
        </footer><!--   footer end-->
            

        
        
        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script src="js/extra/bootstrap.min.js"></script>
        <script src="js/extra/custom.js"></script>
        <script type="text/javascript" src="js/extra/gl-matrix-min.js"></script>
        <script type="text/javascript" src="https://threejs.org/build/three.min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
        <script src="js/utils.js"></script>
        <script type="text/javascript">
            PAS.recover(); // load paisarque session
        </script>
        <script src="js/tools.js"></script>
        <script src="js/events.js"></script>
    </body>
    
</html>