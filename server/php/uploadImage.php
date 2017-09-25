<?php
    $ID = $_POST["id"];
    $estructura = "../../data/" . $ID . "/";

    foreach($_FILES as $index => $file)
    {
        $sourcePath = $_FILES[$index]['tmp_name'];
        $targetPath = $estructura . $_FILES[$index]['name'];
        move_uploaded_file($sourcePath, $targetPath);
        chmod($targetPath, 0777);
    }
?>

