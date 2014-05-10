@echo off

set /p part="Enter part [body|face|hair]: " %=%
set /p model="Enter modelId: " %=%

cd ..
grunt parser --part=%part% --model=%model% --stack & pause > nul