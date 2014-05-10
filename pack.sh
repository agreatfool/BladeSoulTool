#!/bin/bash

cd ..
zip -9 -r ~/Downloads/BladeSoulTool.zip BladeSoulTool -b "/tmp" -x "BladeSoulTool/**/.DS_Store" "BladeSoulTool/**/*.zip" "BladeSoulTool/.git/*" "BladeSoulTool/resources/dedat/output/*" "BladeSoulTool/resources/umodel/output/*"
