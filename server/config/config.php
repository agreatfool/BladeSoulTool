<?php

return new \Phalcon\Config(array(
    'database' => array(
        'adapter'    => 'Mysql',
        'host'       => '127.0.0.1',
        'username'   => 'root',
        'password'   => '123',
        'dbname'     => 'bst',
    ),
    'application' => array(
        'modelsDir'      => __DIR__ . '/../models/',
        'viewsDir'      => __DIR__ . '/../views/',
        'baseUri'        => '/server/',
    )
));
