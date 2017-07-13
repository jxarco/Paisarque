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
    <title>Ayuda PaisArque</title>

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
<!--                        <a class="navbar-brand" href="index.html">PaisArque</a>-->
                        <a class="navbar-brand">PaisArque</a>
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
        
        <content class="row"><div class="col-lg-12">
            <h2>Tutoriales</h2>
            
            <ul  class="nav nav-tabs">
                <li class="active"><a href="#uno" data-toggle="tab" aria-expanded="true">Como crear un modelo 3D</a></li>
                <li> <a href="#dos" data-toggle="tab" aria-expanded="true">Dos</a> </li>
                <li> <a href="#tres" data-toggle="tab" aria-expanded="true">Tres</a> </li>
                <li> <a href="#cuatro" data-toggle="tab" aria-expanded="true">Cuatro</a> </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade active in" id="uno">
                    <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
                    <br/>
                    <div align="center" class="embed-responsive embed-responsive-16by9">
                         <iframe width="560" height="315" src="https://www.youtube.com/embed/6W3R5ItkREk" frameborder="0" allowfullscreen></iframe>
                    </div>
                    
                    
                </div>
                <div class="tab-pane fade" id="dos">
                  <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
                </div>
                <div class="tab-pane fade" id="tres">
                  <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
                </div>
                <div class="tab-pane fade" id="cuatro">
                  <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
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
    </body>
    
</html>