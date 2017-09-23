<?php
    $folder_to_delete = $_REQUEST["folder"];  
    
    $dir = $folder_to_delete;
    $it = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
    $files = new RecursiveIteratorIterator($it,
             RecursiveIteratorIterator::CHILD_FIRST);

    foreach($files as $file) {
        if ($file->isDir()){
            rmdir($file->getRealPath());
        } else {
            unlink($file->getRealPath());
        }
    }

?>