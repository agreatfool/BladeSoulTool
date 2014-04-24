@echo off

echo [PHASE] Detect the script env:

set NODE_FOUND=
for %%X in (node.exe) do (set NODE_FOUND=%%~$PATH:X)
if "%NODE_FOUND%" == "" (
    echo Command node not found, please install it first.
    pause > nul
) else (
    echo Command node detected!
)

set GRUNT_FOUND=
for %%X in (grunt) do (set GRUNT_FOUND=%%~$PATH:X)
if "%GRUNT_FOUND%" == "" (
    echo Command grunt not found, Install it:
    npm install -g grunt-cli & pause > nul
) else (
    echo Command grunt detected!
)

echo --------------------------------------------------------------------

echo [PHASE] Collect data:
set /p race="Enter race info: " %=%

set /p model="Enter target model info: " %=%

set /p color="Enter target color info: " %=%

echo --------------------------------------------------------------------

grunt --race=%race% --model=%model% & pause > nul