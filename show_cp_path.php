<?php
     // Recuperar sesión
    session_start(); 
    $_SESSION['complete-path'] = !$_SESSION['complete-path'];
?>