<?php
     // Recuperar sesión
    session_start(); 

    // Destruir sesion
    session_destroy();

    // limpiar variables de la sesión
    $_SESSION = array();


    if(!isset($_SESSION['current']))
        echo "sesion cerrada correctamente";

    else
        echo "sesion todavia activa (" . $_SESSION['current'] . ")";
?>