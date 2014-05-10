@echo off

set /p part="Enter part [body|face|hair]: " %=%

cd ..
grunt crawler --part=%part% --stack & pause > nul