<?php

/**
 * Auth the actor role
 *
 * @param \Phalcon\Mvc\Micro $app
 * @return void
 */
function auth($app) {
    $token = $app->request->get('token', 'string');
    /* @var Users $admin */
    $admin = Users::findFirst(array('id' => 1));
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
