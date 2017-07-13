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
    <title>Info PaisArque</title>

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
                        <a class="navbar-brand">PaisArque</a>
<!--                        <a class="navbar-brand" href="index.html">PaisArque</a>-->
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
          
        <content id="content" class="row"><div class="col-lg-12">
            
            <ul  class="nav nav-tabs">
                <li class="active"><a href="#imagenes" data-toggle="tab" aria-expanded="true">Imágenes</a></li>
                <li> <a href="#pdfs" data-toggle="tab" aria-expanded="true">PDFs</a> </li>
                <li> <a href="#texto" data-toggle="tab" aria-expanded="true">Texto</a> </li>
                <li> <a href="#videos" data-toggle="tab" aria-expanded="true">Videos</a> </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade active in" id="imagenes">
                    
                </div>
                <div class="tab-pane fade" id="pdfs">
                  
                </div>
                <div class="tab-pane fade" id="texto">
                 
                </div>
                <div class="tab-pane fade" id="videos">
                  
                </div>
            </div>

        </div></content><!--  content end-->
        
        <footer>
        
        </footer><!--   footer end-->
            

        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <!-- Include all compiled plugins (below), or include individual files as needed -->
        <script src="js/extra/bootstrap.min.js"></script>
        <script src="js/extra/custom.js"></script>
        <script src="js/tools.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
        <script>
            
            function parseJSON(json)
            {
                console.log(json)
                if(!json.extra){
                    console.err("empty");
                    return
                }
                var el = null;
                for(var e in json.extra){
                    el = json.extra[e];
                    if (el.type == "image") {
                        $("#imagenes").append(build[el.type](el.data));
                    } else if (el.type == "text") {
                        $("#texto").append(build[el.type](el.data));
                    } else if (el.type == "pdf") {
                        $("#pdfs").append(build[el.type](el.data));
                    } else if (el.type == "youtube") {
                        $("#videos").append(build[el.type](el.data));
                    }
                }
                
            }
            
            var build = {};
            build.pdf = function(url){
                var t = "<div class='embed-responsive' style='padding-bottom:75vh'>"
                    t+= "<object data='"+url+"' type='application/pdf' width='100%' height='100%'></object>"
                    t+= "</div>";
                return t;    
            }
            
            build.text = function(text){
                return '<p>'+text+'</p></br>';
            }
            
            build.youtube = function(id){
                return '<div align="center" class="embed-responsive embed-responsive-16by9"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+id+'" frameborder="0" allowfullscreen></iframe></div>';
            }
            build.image = function(data){
                return '<img src="'+data+'" class="img-responsive" alt="Responsive image">';
            }
                 
        </script>
    </body>
    
</html>