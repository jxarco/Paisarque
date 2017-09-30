<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Exportar PaisArque</title>
    <link rel="icon" href="http://icons.iconarchive.com/icons/icons8/windows-8/512/City-Archeology-icon.png">    
    <!-- Bootstrap -->
     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link href="css/estilo.css" rel="stylesheet">
    <link href="css/header.css" rel="stylesheet">
    <link href="css/tables.css" rel="stylesheet">
    <link rel="stylesheet" href="css/RWD.css"> <!-- responsive web design -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Oswald">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <script type="text/javascript">
        // Used to toggle the menu on small screens when clicking on the menu button
        function showNavbar() {
            var x = document.getElementById("navDemo");
            if (x.className.indexOf("w3-show") == -1) {
                x.className += " w3-show";
            } else { 
                x.className = x.className.replace(" w3-show", "");
            }
        }
    </script>

        
</head>
    <body style="padding-bottom: 200px !important;">
        
       <!-- Navbar -->
        <div class="w3-top">
          <div class="w3-bar w3-card-2">
            <a class="w3-bar-item w3-button w3-padding-large w3-hide-large w3-right" onclick="showNavbar()" title="Toggle Navigation Menu"><i class="fa fa-bars"></i></a>
            <a onclick="loadContent('inicio.php')" id="megatitle" class="w3-bar-item w3-button w3-padding-large">PaisArque</a>
            <a onclick="loadContent('modelo.html')" class="w3-bar-item w3-button w3-padding-large w3-hide-small w3-hide-medium">3D</a>
            <a onclick="loadContent('infoextra.html')" class="w3-bar-item w3-button w3-padding-large w3-hide-small w3-hide-medium">APORTACIONES</a>
            <a onclick="loadContent('exportar.php')" class="w3-bar-item w3-button w3-padding-large w3-hide-small w3-hide-medium active">EXPORTAR</a>
            <a onclick="loadContent('ayuda.html')" class="w3-bar-item w3-button w3-padding-large w3-hide-small w3-hide-medium">AYUDA</a>
            <a class="w3-bar-item w3-button w3-right w3-padding-large logout-button"><span class="glyphicon glyphicon-off" aria-hidden="true"></span></a>
            <a class="w3-bar-item w3-button w3-right w3-padding-large w3-hide-small w3-hide-medium textUser">username</a>
          </div>
        </div>

        <!-- Navbar on small screens -->
        <div id="navDemo" class="w3-bar-block w3-hide w3-hide-large w3-top" style="margin-top:46px">
            <a class="w3-bar-item w3-button w3-padding-large textUser">username</a>
            <a onclick="loadContent('modelo.html')" class="w3-bar-item w3-button w3-padding-large">3D</a>
            <a onclick="loadContent('infoextra.html')" class="w3-bar-item w3-button w3-padding-large">APORTACIONES</a>
            <a onclick="loadContent('exportar.php')" class="w3-bar-item w3-button w3-padding-large">EXPORTAR</a>
            <a onclick="loadContent('ayuda.html')" class="w3-bar-item w3-button w3-padding-large">AYUDA</a>
        </div>
        
        <content class="row"><div class="col-lg-12" style="margin-top:46px">
            
            <h3 class="w3-xlarge"><b>EXPORTAR</b></h3>
            <br>            
            
            <div class="wrap">
                <div class="css-table">
                    <ul>
                        <li>
                          <div class="top">
                            <h3>MODELO</h3>
                            <div class="circle blue">3D</div>
                          </div>
                          <div class="bottom">
                              <?php 
                              
                                $info = explode("/", $_GET['r']);
                              
                                $user = $info[0];
                                $project = $info[1];
                              
                                $path = "litefile/files/" . $user . "/projects/" . $project;
                              
                                echo '<a href="';
                                echo $path . '/mesh.obj"';
                                echo 'download="" title="Descargar mesh">Mesh</a><br><br>';
                             
                                echo '<a href="';
                                echo $path . '/tex_0.jpg"';
                                echo 'download="" title="Descargar textura">Textura</a><br><br>';
                             ?>
                          </div>
                        </li>

                        <li>
                          <div class="top">
                            <h3>PROYECTO</h3>
                            <div class="circle pink">PDF</div>
                          </div>
                            <div class="bottom">
                            <a class="export-pdf summary" title="Exportar en PDF" href="">Resumen</a><br><br>
                            <a class="export-pdf detailed" title="Exportar en PDF" href="">Detalle</a><br><br>
                            <a class="export-pdf config" title="Exportar en PDF" href="">Configuración</a><br><br>
                            <a class="export-pdf aport" title="Exportar en PDF" href="">Aportaciones</a><br><br>
                          </div>
                        </li>

                        <li>
                          <div class="top">
                            <h3>TABLAS</h3>
                            <div class="circle green">CSV</div>
                          </div>
                            <div class="bottom">
                                <a class="export-xls _anotations" title="Exportar en CSV" href="">Anotaciones</a><br><br>
                                <a class="export-xls _measures" title="Exportar en CSV" href="">Medidas</a><br><br>
                                <a class="export-xls _areas" title="Exportar en CSV" href="">Areas</a><br><br>
                          </div>
                        </li>

                        <li>
                          <div class="top">
                            <h3>OBJETO</h3>
                            <div class="circle">JSON</div>
                          </div>
                            <div class="bottom">
                                <a class="export-json _anotations" title="Exportar en JSON" href="">Anotaciones</a><br><br>
                                <a class="export-json _measures" title="Exportar en JSON" href="">Medidas</a><br><br>
                                <a class="export-json _areas" title="Exportar en JSON" href="">Areas</a><br><br>
                                <?php
                                
                                    $info = explode("/", $_GET['r']);

                                    $user = $info[0];
                                    $project = $info[1];

                                    $path = "litefile/files/" . $user . "/projects/" . $project;
                                
                                    echo '<a href="';
                                    echo $path . '.json"';
                                    echo 'download="" title="Descargar configuración en JSON">Configuración</a><br><br>';
                                 ?>
                                <a class="export-json _extra" title="Exportar en JSON" href="">Aportaciones</a><br><br>
                          </div>
                        </li>
                    </ul>
                </div>
            </div>
            
        </div>
        
        </content>
        
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
            

         <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.js"></script>
        <script type="text/javascript" src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
        <script type="text/javascript" src="js/extra/jspdf.min.js"></script>
        <script type="text/javascript" src="js/extra/bootstrap.min.js"></script>
        <script type="text/javascript" src="js/extra/custom.js"></script>
        <script type="text/javascript" src="js/extra/gl-matrix-min.js"></script>
        <script type="text/javascript" src="js/extra/rangeslider.min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
        <script src="js/project.js"></script>
        <script src="js/utils.js"></script>
       <script type="text/javascript">
            PAS.recover(); // load paisarque session
        </script>
        <script src="js/tools.js"></script>
        <script src="js/events.js"></script>
        <script>
            LOADER.loadProject();
        </script>
    </body>
    
</html>