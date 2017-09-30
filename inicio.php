<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

        <title>PaisArque - Proyectos (ES)</title>
        <link rel="icon" href="http://icons.iconarchive.com/icons/icons8/windows-8/512/City-Archeology-icon.png">    
        <!-- Bootstrap -->
        <link href="css/bootstrap.min.css" rel="stylesheet">
        <link href="css/stylesheet.css" rel="stylesheet">
        <link rel="stylesheet" href="css/responsive-design.css"> <!-- responsive web design -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
        <link href="https://fonts.googleapis.com/css?family=Lobster" rel="stylesheet">
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
                            
                            <button id="addProject" class="submit-button btn btn-lg btn-block inicio" data-style="slide-up" data-color="green" type="submit" data-toggle="modal" data-target="#GSCCModal"><span class="ladda-label">Crear nuevo proyecto</span><span class="ladda-spinner"></span></button>
<!--
                            <button id="delete-project" class="submit-button btn  btn-lg btn-block ladda-button inicio" data-style="slide-up" data-color="green" type="submit"><span class="ladda-label">Eliminar proyecto existente</span><span class="ladda-spinner"></span></button>
                            
-->
                            <!-- Listamos los ficheros que hay en el servidor/carpeta y sus propiedades -->
                            <table id="projects-tb" class="table">
                                <thead>
                                    <tr>
                                        <th>Vista previa</th>
                                        <th>Nombre proyecto</th>
                                        <th class="w3-hide-small">Autor proyecto</th>
                                        <th class='w3-hide-small w3-hide-medium'>Lugar</th>
                                    </tr>
                                </thead>
                                <tbody id="tableInicio">
                                    <!-- Esto es necesario para saber cuantos JSON hay y hacer una lista de ellos para luego acceder al modelo -->
                                    <?php                                         
                                        $directory = "litefile/files/" . $_GET['user'] ."/projects/";

                                        $filecount = 0;
                                        $files = glob($directory . "*.{json}",GLOB_BRACE);

                                        if ($files){
                                            $filecount = count($files);
                                        }
                                    
                                        for ($i = 0; $i < $filecount; $i = $i+1) {

                                            $username = $_GET['user'];
                                            $hoops = strlen("litefile/files/") + strlen($username) + strlen("/projects/");
                                            $project = substr(substr($files[$i], $hoops),0, -5); // -5(.json)
                                            $folder = $username . "/" . $project;
                                            $src_preview = "litefile/files/" . $_GET['user'] ."/projects/" . $project . "/preview.png"; 
                                            
                                            $exists = file_exists($src_preview);
                                            if(!$exists)
                                                 $src_preview = "litefile/files/project-preview.png"; 
                                            
                                            print_r( '<tr class="pointer" id="' . $project . '" onclick' . '=' . '"loadContent(' . "'modelo.html','");
                                            print_r( $folder );
                                            print_r( "')" . '"' . ">" );
                                            print_r( "<td>" . "<img class='project-preview ' src='" . $src_preview . "' title='Vista previa de " . $project . "'>" . "</td>" );
                                            print_r( "<td>" . ucfirst($project)  . "</td>");
                                            
                                            print_r("<td class='w3-hide-small'>");
                                            $string = file_get_contents($files[$i]);
                                            $json_a = json_decode($string, true);

                                            foreach ($json_a as $k => $v) {
                                                if ($k == "autor")
                                                     print_r($v);
                                            }

                                            print_r("</td><td class='w3-hide-small w3-hide-medium'><div>");

                                            foreach ($json_a as $k => $v) {
                                                if ($k == "lugar")
                                                    print_r($v);
                                            }

                                            print_r("</div></td></tr><br>");
                                        }
                                    ?>
                                </tbody>
                            </table> 
                            
                        </div>
                    </div>
                    
                    <img src="data/assets/bbva.png" class="img-responsive" style="margin-left: calc(50% - 50px); width: 100px;">
                        
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
                                    <input required type="text" class="form-control" id="idProyecto" placeholder="Nombre del proyecto" name="idProyecto" style="text-transform:lowercase" >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="autor" class="col-lg-2 control-label">Autor</label>
                                <div class="col-lg-10">
                                    <input required type="text" class="form-control" id="autor" placeholder="Autor" name="autor">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="lugar" class="col-lg-2 control-label">Lugar</label>
                                <div class="col-lg-10">
                                    <input required type="text" class="form-control" id="lugar" placeholder="Lugar" name="lugar">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="latitud" class="col-lg-2 control-label">Latitud</label>
                                <div class="col-lg-10">
                                    <input required type="number" step="any"  class="form-control" id="latitud" name="latitud" placeholder="Latitud">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="longitud" class="col-lg-2 control-label">Longitud</label>
                                <div class="col-lg-10">
                                    <input required type="number" step="any" class="form-control" id="longitud" name="longitud" 
                                    placeholder="Longitud">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="mesh" class="col-lg-2 control-label">Mesh</label>
                                <div class="col-lg-10">
                                    <input required type="file" class="form-control" id="mesh" name="mesh">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="textura" class="col-lg-2 control-label">Textura</label>
                                <div class="col-lg-10">
                                    <input required type="file" class="form-control" id="textura" name="textura">
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
            <p>Proyecto PaisArque - <a href="https://www.upf.edu/web/paisarque">upf.edu/web/paisarque</a></p>
            <p>CaSES: Complexity and Socio-Ecological Dynamics - Edificio Mercè Rodoreda (Campus de la Ciutadella)
                Ramon Trias Fargas, 25-27
                08005 Barcelona
                cases@upf.edu - <a href="https://www.upf.edu/web/cases">upf.edu/web/cases</a></p>
            <p>Interactive Technologies Group - Edificio Tànger (Campus de la Comunicació-Poblenou)
                    Tànger, 122-140 
                    08018 Barcelona - <a href="http://gti.upf.edu/">gti.upf.edu</a></p>
            <img height="20px;" src="http://icons.iconarchive.com/icons/icons8/windows-8/512/City-Archeology-icon.png">    
        </footer><!--   footer end-->
        
        
        </body>
            
        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.js"></script>
        <script type="text/javascript" src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
        <script type="text/javascript" src="js/extra/gl-matrix-min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script type="text/javascript" src="js/extra/bootstrap.min.js"></script>
        <script type="text/javascript" src="js/extra/custom.js"></script>
        <script type="text/javascript" src="litefile/litefileserver.js"></script>
        <script type="text/javascript" src="litefile/js/codeLite.js"></script>
        <script src="js/utils.js"></script>
        <script src="js/tools.js"></script>
        <script type="text/javascript">
            PAS.recover(); // load paisarque session
        </script>
        <script src="js/events.js"></script>
        <script type="text/javascript">
        
        $(function() {
            $('#idProyecto').on('keypress', function(e) {
                if (e.which == 32)
                    return false;
            });
        });
        
        </script>
    
</html>