<?php

//Site info *************************
define('HOST_URL','paisarque.upf.edu');
define('MAIL_ADDRESS','melanie.torres@upf.com');

// SQL database *********************
define('DB_NAME', 'paisarque'); //your database name
define('DB_USER', 'mtorres'); //your database user
define('DB_PASSWORD', 'Caca27'); //your database password
define('DB_HOST', 'localhost'); //your database host

define('DB_PREFIX', 'lfs_');
define('DB_REDIS', false ); //use redis database (mostly for sessions), otherwise it will use SQL

//System ****************************
define('ADMIN_PASS','UPF062017'); //CHANGE THIS
define('ADMIN_MAIL','melanie.torres@upf.edu'); //CHANGE THIS
define('GLOBAL_PASS_SALT','ketchup with pasta'); //ENTER SOMETHING RANDOM HERE
define('UNITNAME_SALT','red unyas dinosaurio'); //ENTER SOMETHING RANDOM HERE

//Config *************************
define('BACKUPS_FOLDER', '../backup' ); //folder to store the backups
define('ALLOW_WEB_REGISTRATION', true ); //allow people to create users
define('ALLOW_BIG_FILES', true ); //allow big files to be uploaded by parts
define('DEFAULT_USER_SPACE', 500 ); //in MBs
define('VALIDATE_ACCOUNTS', false ); //force people to validate the account once created
define('FILES_PATH','files/');  //folder where all the files will be stored
define('PREVIEW_PREFIX','_th_'); //prefix added to the filename to designate a preview of a file
define('PREVIEW_SUFIX','.jpg');  //sufix added to the filename of every preview
define('USE_EXTENSIONS_WHITELIST',false); //in case you want to accept only some type of files
define('EXTENSIONS_WHITELIST','png,jpg,jpeg,bmp,txt,json,js,css,html,htm,ttf,otf,webm,wav');
define('USE_EXTENSIONS_BLACKLIST',true); //in case you want to ban some type of files
define('EXTENSIONS_BLACKLIST','exe,o,dll,php,py,rb,app,apk,bat,cmd,com,inx,ipa,isu,job,lnk,msc,msi,msp,mst,osx,out,paf,pif,reg,run,rgs,sct,shb,shs,u3p,vb,vbe,vbs,ws,wsf');

define('VALID_EXTENSIONS','png,jpg,jpeg,bmp,txt,json,js,css,html,htm,ttf,otf,wbin,obj,dae');
define('ALLOW_REMOTE_FILE_DOWNLOADING', false );  //allows to upload files that are not in this server

//used to rename categories by file type
$categories_by_type = Array();

?>