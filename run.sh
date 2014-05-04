#!/bin/bash

forever start -o logs/forever.log -e logs/forever-error.log -a --minUptime=1000ms --spinSleepTime=1000ms -d -v -w express/app.js