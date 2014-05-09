@echo off

set /p part="Enter part [body|face|hair]: " %=%

grunt crawler --part=%part% --stack & pause > nul