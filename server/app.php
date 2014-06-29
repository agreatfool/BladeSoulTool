<?php

define('ADMIN_USER_ID', 1);
define('SINGLE_PAGE_COUNT', 30);

/**
 * Auth the actor role
 *
 * @param \Phalcon\Mvc\Micro $app
 * @return void
 */
function auth($app) {
    $token = $app->request->get('token', 'string');
    /* @var Users $admin */
    $admin = Users::findFirst(array('id' => ADMIN_USER_ID));
    if (!$admin || !($admin instanceof Users) || $admin->token !== $token) {
        echo -999; die;
    }
}

/**
 * Index handler
 */
$app->map('/', function () use ($app) {
    auth($app);
    /* @var Phalcon\Mvc\View $view */
    $view = $app['view'];
    echo $view->getRender(null, 'index');
});

/**
 * Display issue list via page
 */
$app->map('/issues/page/{page:[0-9]+}', function ($page) use ($app) {
    auth($app);
    echo json_encode(Issues::find(array(
        'order' => 'time ASC',
        'limit' => array(
            'offset' => ($page - 1) * SINGLE_PAGE_COUNT + 1,
            'number' => SINGLE_PAGE_COUNT
        )
    ))->toArray());
});
/**
 * TODO
 * 单独做一个搜索入口，需要auth，专门做一个单独的template来显示这个搜索结果页面
 * 此外，需要稍微看下模板引擎，如何将layout拆出来，不要每个页面都单独写自己的script head标签
 * angular这边需要做一个展示页面用来展示issue的细节（模态窗口？）、分页功能
 * 此外还需要添加一个mark solved的功能入口
 * ---
 * 进游戏的时候upk重复的情况那个弹窗，需要截图
 */

/**
 * Search issue
 */
$app->map('/issues/search/{id}', function ($id) use ($app) {
    auth($app);
    /* @var Phalcon\Mvc\View $view */
    $view = $app['view'];
    $view->setVar('issue', Issues::findFirst(array('id' => $id)));
    echo $view->getRender(null, 'search');
});

/**
 * Get total issues count
 */
$app->map('/issues/total', function () use ($app) {
    auth($app);
    echo count(Issues::find());
});

/**
 * Create issue
 */
$app->map('/issues/new', function () use ($app) {
    // 获取参数
    $origin = $app->request->get('origin', 'string');
    $target = $app->request->get('target', 'string');
    $console = $app->request->get('console', 'string');
    $ip = $app->request->getClientAddress();
    if (!$origin || !$target || !$console) {
        echo -1; return; // 必须项为空
    }

    // 解json，查看格式是否正确
    $origin = json_decode($origin, true);
    $target = json_decode($target, true);
    if (!$origin || !$target) {
        echo -1; return;
    }

    // 重新encode成json字符串，用来存储
    $origin = json_encode($origin);
    $target = json_encode($target);
    $id = md5($origin . $target);

    $issue = new Issues();
    $issue->id = $id;
    $issue->ip = $ip;
    $issue->origin = $origin;
    $issue->target = $target;
    $issue->console = $console;
    $issue->solved = 0;
    $issue->time = time();

    if ($issue->create() === false) {
        echo -2 . '|' . $id; return; // 报单已存在
    }

    echo $id;
});

//$app->map('/issues/dummy', function () use ($app) {
//    // 获取参数
//    $time = time();
//    for ($i = 0; $i < 400; $i++) {
//        $origin = array(
//            'skeleton' => 'skeleton' . $i,
//            'texture' => 'texture' . $i,
//            'material' => 'material' . $i,
//            'col1Material' => 'col1Material' . $i,
//            'col' => 'col1',
//            'core' => 'core' . $i,
//            'code' => 'code' . $i,
//            'race' => 'race' . $i,
//            'pic' => 'pic' . $i
//        );
//        $target = array(
//            'skeleton' => 'skeleton' . $i,
//            'texture' => 'texture' . $i,
//            'material' => 'material' . $i,
//            'col1Material' => 'col1Material' . $i,
//            'col' => 'col1',
//            'core' => 'core' . $i,
//            'code' => 'code' . $i,
//            'race' => 'race' . $i,
//            'pic' => 'pic' . $i
//        );
//
//        // 重新encode成json字符串，用来存储
//        $origin = json_encode($origin);
//        $target = json_encode($target);
//        $id = md5($origin . $target);
//
//        $issue = new Issues();
//        $issue->id = $id;
//        $issue->ip = '127.0.0.1';
//        $issue->origin = $origin;
//        $issue->target = $target;
//        $issue->console = '["console"]';
//        $issue->solved = 0;
//        $issue->time = $time + $i;
//
//        if ($issue->create() === false) {
//            echo -2 . '|' . $id; return; // 报单已存在
//        }
//    }
//
//    echo 'done';
//});

/**
 * Not found handler
 */
$app->notFound(function () use ($app) {
    echo 404; die;
});
