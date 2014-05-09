#!/bin/bash

cd ..
zip -9 -r BladeSoulTool.zip BladeSoulTool -x "BladeSoulTool/**/.DS_Store" "BladeSoulTool/**/*.zip" "BladeSoulTool/.git/*" "BladeSoulTool/resources/dedat/output/*" "BladeSoulTool/resources/umodel/output/*"
