<?php
    $ID = $_POST["idProyecto"];
    $estructura = "../../data/" . $_POST["user"] . "/" . $ID . "/";
    mkdir($estructura, 0777, true);

    var_dump($estructura);

    foreach($_FILES as $index => $file) {

        $sourcePath = $_FILES[$index]['tmp_name'];
        $targetPath = $estructura . $_FILES[$index]['name'];
        move_uploaded_file($sourcePath,$targetPath);
        
        chmod($targetPath, 0777);
    }
?>