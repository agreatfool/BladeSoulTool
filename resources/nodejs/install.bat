@echo off

set NODE_FOUND=
for %%X in (node.exe) do (set NODE_FOUND=%%~$PATH:X)
if "%NODE_FOUND%" == "" (
    echo Command node not found, please install it first.
    pause > nul
) else (
    echo Command node detected!
)

npm install -g grunt-cli & pause > nul