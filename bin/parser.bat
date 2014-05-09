@echo off

set /p part="Enter part [body|face|hair]: " %=%

grunt parser --part=%part% --stack & pause > nul