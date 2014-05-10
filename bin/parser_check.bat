@echo off

set /p part="Enter part [body|face|hair]: " %=%

cd ..
grunt parser_check --part=%part% --stack & pause > nul