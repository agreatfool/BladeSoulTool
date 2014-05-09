@echo off

set /p part="Enter part [body|face|hair]: " %=%

grunt shooter --part=%part% --stack & pause > nul