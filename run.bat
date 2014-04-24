@echo off

REM --------------------------------------------------------------------
echo [Phase I] Detect the script env:

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
    npm install -g grunt-cli
) else (
    echo Command grunt detected!
)

REM --------------------------------------------------------------------
echo [Phase II] Run the script:
grunt

REM --------------------------------------------------------------------
pause > nul