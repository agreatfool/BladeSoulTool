@echo off

set /p part="Enter part [body|face|hair]: " %=%

grunt parser_check --part=%part% --stack & pause > nul