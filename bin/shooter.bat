@echo off

set /p part="Enter part [body|face|hair]: " %=%

cd ..
grunt shooter --part=%part% --stack & pause > nul