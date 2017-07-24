<?php

    $ID = lcfirst($_POST["idProyecto"]);
    $ID = str_replace(' ', '_', $ID);

    $estructura = "data/" . $_POST["user"] . "/" . $ID . "/";
    mkdir($estructura, 0777, true);

    echo $estructura;

    foreach($_FILES as $index => $file) {

        $sourcePath = $_FILES[$index]['tmp_name'];
        $targetPath = "data/" . $_POST["user"] . "/" . $ID . "/" . $_FILES[$index]['name'];
        move_uploaded_file($sourcePath,$targetPath);
        
        chmod($targetPath, 0777);
    }

    print_r($_POST);
    print_r($_FILES);
?>