@echo off

set /p part="Enter part [body|face|hair]: " %=%

grunt crawler_check --part=%part% --stack & pause > nul