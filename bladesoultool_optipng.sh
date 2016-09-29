#!/bin/bash

TOOL_HOME=/Users/Jonathan/Downloads/BladeSoulTool
DB_HOME=${TOOL_HOME}/database

TARGET_DIR=${DB_HOME}/$1/pics
OUTPUT_DIR=${DB_HOME}/${1}/pics-cps

if [ ! -d "${TARGET_DIR}" ]; then
    echo "DIR ${TARGET_DIR} not found."
    exit
fi

if [ ! -d "${OUTPUT_DIR}" ]; then
    echo "DIR ${OUTPUT_DIR} not found."
    exit
fi

find ${TARGET_DIR} -iname "*.png" -print0 | xargs -0 -n 1 -P 4 optipng -dir=${OUTPUT_DIR} -o7 -clobber 
