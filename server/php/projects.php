<?php         
        $username = $_POST['user'];        
        $directory = "../../litefile/files/" . $username ."/projects/";        

        $filecount = 0;
        $files = glob($directory . "*.{json}",GLOB_BRACE);

        if ($files){
            $filecount = count($files);
        }

        $response = array();

        for ($i = 0; $i < $filecount; $i = $i+1) {

            $tmp = array();
            
            $hoops = strlen("../../litefile/files/") + strlen($username) + strlen("/projects/");
            $project = substr(substr($files[$i], $hoops),0, -5); // -5(.json)
            $folder = $username . "/" . $project;
            array_push($tmp, $username);
            array_push($tmp, $project);
                
            $src_preview = "../../litefile/files/" . $username ."/projects/" . $project . "/preview.png"; 
            $exists = file_exists($src_preview);
            array_push($tmp, $exists);
            
            $string = file_get_contents($files[$i]);
            $json_a = json_decode($string, true);
//
            foreach ($json_a as $k => $v) {
                if ($k == "autor")
                    array_push($tmp, $v);
            }
            
            foreach ($json_a as $k => $v) {
                if ($k == "lugar")
                    array_push($tmp, $v);
            }
            
            // push all properties as one array to response
            array_push($response, $tmp);
        }

        $jsonData = json_encode($response); 
        echo $jsonData;
?>