@echo off

set /p part="Enter part [body|face|hair]: " %=%
set /p model="Enter modelId: " %=%

cd ..
grunt replace --part=%part% --model=%model% --stack & pause > nul