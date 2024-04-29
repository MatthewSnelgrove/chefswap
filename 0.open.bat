@echo off
cls

rem Open VS Code in the current directory
code .

rem Wait for VS Code to open
timeout /nobreak /t 5 >nul

rem Create first terminal in VS Code and run "cd client && npm run dev"
code --new-terminal -e "cd client && npm run dev"

rem Create second terminal in VS Code and run "cd server && npm run dev"
code --new-terminal -e "cd server && npm run dev"