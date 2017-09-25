<?php

    $estructura = "../../data/" . $_POST["user"] . "/";
    mkdir($estructura, 0777, true);

?>