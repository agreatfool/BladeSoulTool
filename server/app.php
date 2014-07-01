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
    $admin = Users::findFirst("id = " . ADMIN_USER_ID);
    if (!$admin || !($admin instanceof Users) || $admin->token !== $token) {
        echo -999; die;
    }
}

/**
 * Index handler
 */
$app->map('/', function () use ($app) {
    auth($app);
    /* @var Phalcon\Mvc\View\Simple $view */
    $view = $app['view'];
    echo $view->render('index');
});

/**
 * Display issue list via page
 */
$app->map('/issues/page/{page:[0-9]+}', function ($page) use ($app) {
    auth($app);
    echo json_encode(Issues::find(array(
        'order' => 'time ASC',
        'limit' => array(
            'offset' => ($page - 1) * SINGLE_PAGE_COUNT,
            'number' => SINGLE_PAGE_COUNT
        )
    ))->toArray());
});

/**
 * Search issue
 */
$app->map('/issues/search/{id}', function ($id) use ($app) {
    $issue = Issues::findFirst("id = '{$id}'");
    /* @var Phalcon\Mvc\View\Simple $view */
    $view = $app['view'];
    if ($issue) {
        $view->setVar('issue', $issue);
    }
    echo $view->render('search');
});

$app->map('/issues/solve/{id}', function ($id) use ($app) {
    auth($app);
    /* @var Issues $issue */
    $issue = Issues::findFirst("id = '{$id}'");
    if ($issue) {
        $issue->solved = 1;
        $issue->update();
        echo 1;
    } else {
        echo -1;
    }
});

/**
 * Get total issues count
 */
$app->map('/issues/total', function () use ($app) {
    auth($app);
    echo Issues::count();
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

/**
 * Not found handler
 */
$app->notFound(function () use ($app) {
    echo 404; die;
});
