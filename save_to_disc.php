<?php
    $stringFile = $_POST["file"];
    $myFile = $stringFile;
    $fh = fopen($myFile, 'w') or die("can't open file");
    $stringData = $_POST["data"];
    fwrite($fh, $stringData);
    chmod($myFile, 0777);
    fclose($fh);
?>