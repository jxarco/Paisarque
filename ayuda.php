<?php 
                    
    // Recuperar sesión
    session_start(); 
    
    if(!isset($_SESSION['current']))
    {
       $_SESSION['current'] = "guest";
    }
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
    <link href="css/header.css" rel="stylesheet">
    <link href="css/estilo.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    </head>
    <body class="container">
        
        <header>
            <nav>
                <div id="megadiv">
                        <a id="megatitle"><span>Paisarque </span></a>
                </div>
                <div>
                        <a onclick="<?php echo "location.href = 'inicio.php?user=" . $_SESSION['current'] . "'"; ?>"><span>Inicio </span></a>
                </div>
                <div>
                        <a onclick="loadContent('modelo.php')"><span>3D </span></a>
                </div>
                <div>
                        <a onclick="loadContent('infoextra.php')"><span>Información </span></a>
                </div>
                <div>
                        <a onclick="loadContent('exportar.php')"><span>Exportar </span></a>
                </div>
                <div>
                        <a onclick="loadContent('ayuda.php')"><span>Ayuda </span></a>
                </div>
                <div>
                        <a class="space"><span>-</span></a>
                </div>
                <div>
                        <a id="textUser">username</a>
                </div>
                
                <div>
                        <a id="logout"><span class="glyphicon glyphicon-off" aria-hidden="true">
                            </span></a>
                </div>
                
            </nav>
        </header><!--   header end-->
        
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
        <script type="text/javascript" src="js/extra/gl-matrix-min.js"></script>
        <script type="text/javascript" src="js/extra/rangeslider.min.js"></script>
        <script type="text/javascript" src="js/extra/litegl.js"></script>
        <script type="text/javascript" src="js/extra/rendeer.js"></script>
        <script src="litefile/litefileserver.js"></script>
        <script src="litefile/js/codeLite.js"></script>
        <script src="js/utils.js"></script>
        <script src="js/tools.js"></script>
        <script src="js/events.js"></script>
    </body>
    
</html>