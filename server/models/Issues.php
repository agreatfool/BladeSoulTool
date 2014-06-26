<?php

class Issues extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var string
     */
    public $id;

    /**
     *
     * @var string
     */
    public $ip;

    /**
     *
     * @var string
     */
    public $origin;

    /**
     *
     * @var string
     */
    public $target;

    /**
     *
     * @var string
     */
    public $console;

    /**
     *
     * @var integer
     */
    public $solved;

    /**
     * Independent Column Mapping.
     */
    public function columnMap()
    {
        return array(
            'id' => 'id', 
            'ip' => 'ip', 
            'origin' => 'origin', 
            'target' => 'target', 
            'console' => 'console', 
            'solved' => 'solved'
        );
    }

}
