<?php
     // Recuperar sesión
    session_start(); 

    // Destruir sesion
    session_destroy(); 
    $_SESSION = array();


    if(!isset($_SESSION['current']))
    {
        echo "sesion cerrada correctamente";
        echo '<script type="text/javascript">alert("closed!");</script>';
    }

    else
        echo "sesion todavia activa (" . $_SESSION['current'] . ")";
?>