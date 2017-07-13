<?php 
               
    $DEBUG = true;

    // Recuperar sesión
    session_start(); 
    
    if(!$DEBUG)
        return;
    
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
    <title>Exportar PaisArque</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/custom.min.css" rel="stylesheet">
    <link href="css/estilo.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
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
                        <a class="navbar-brand">PaisArque</a>
<!--                        <a class="navbar-brand" href="index.html">PaisArque</a>-->
                    </div>
                    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav">
                        <!--<li> 
                            <a id="project" href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"> Projects <span class="caret"></span></a>
                            <ul class="dropdown-menu" role="menu">
                                <li><a onclick="loadContent('index.html','pit')">   Pit       </a></li>
                                <li><a onclick="loadContent('index.html','piramide')">      Piramide   </a></li>
                                <li><a onclick="loadContent('index.html','grave')">    Grave     </a></li>
                            </ul>
                        </li>-->
                        <li> <a onclick="<?php echo "location.href = 'inicio.php?user=" . $_SESSION['current'] . "'"; ?>"> Inicio</a> </li>
                        <li> <a onclick="loadContent('modelo.html')"> Modelo 3D</a> </li>
                        <li> <a onclick="loadContent('infoextra.php')">   Info Extra </a> </li>
                        <li> <a onclick="loadContent('exportar.html')">   Exportar </a> </li>
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
        
        <content class="container"></content>
        <!--Aqui tendrian que haber diferentes opciones de export (jpg/pdf):
        <br>
        - Modelo 3D con sin info/medidas/anotaciones
        <br>
        - Snapshots de modelo 3D
        <br>
        - Opciones de modificar la imagen final (cambiar color de fondo, añadir escala)
        <br>
        - Posibilidad de exportar anotaciones en formato word/medidas, etc.-->

        <?php 
            echo '<a href="';
            echo 'data/' . $_GET['r'] . '/mesh.obj"';
            echo 'download="" title="Descargar Mesh" type="button" class="btn btn-default">Descargar Mesh</a>';
            echo '<a href="';
            echo 'data/' . $_GET['r'] . '/tex_0.jpg"';
            echo 'download="" title="Descargar Textura" type="button" class="btn btn-default">Descargar Textura</a>';
            echo '<a href="';
            echo 'data/' . $_GET['r'] . '.json"';
            echo 'download="" title="Descargar archivo de configuración" type="button" class="btn btn-default">Descargar archivo de configuración</a>';
            echo '<a href="';
            echo 'data/' . $_GET['r'] . '_anotacion.json"';
            echo 'download="" title="Descargar archivo de anotaciones" type="button" class="btn btn-default">Descargar archivo de anotaciones</a>';
        ?>

        <br>
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
        <!--<script> 
            
            
            function parseJSON(json){
                var renderData = json.render;
                if(!renderData.mesh){
                    console.err("There is no mesh");
                    return
                }
                
                var renderData = json.render;
                
                var meshURL = renderData.mesh;
                var textureURL = renderData.texture;
                
                if (textureURL.length > 1) {
                    console.log("MAS DE UNA TEXTURA");
                }
                
                init(current_project, meshURL, textureURL);
            }
        </script> -->
    </body>
    
</html>