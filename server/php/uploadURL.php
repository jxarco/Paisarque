<?php
if($_POST){
    //get the url
    $url = $_POST['url'];
    $path = $_POST['path'];
    $upload = file_put_contents($path, file_get_contents($url));
    //check success
    if($upload)
         print_r("Success uploading " . $path); 
    else
         print_r("error uploading");
}
?>