@echo off
echo Running GEMS AI Search Enhancements Verification...

REM Change these variables to match your SQL Server instance and authentication
set SERVER=localhost
set DATABASE=GEMS-UAT
set USERNAME=your_username
set PASSWORD=your_password

REM Uncomment the appropriate command based on your authentication method:

REM For SQL Server Authentication:
REM sqlcmd -S %SERVER% -d %DATABASE% -U %USERNAME% -P %PASSWORD% -i "%~dp0verify_enhancements.sql" -o "%~dp0verification_results.txt"

REM For Windows Authentication:
sqlcmd -S %SERVER% -d %DATABASE% -E -i "%~dp0verify_enhancements.sql" -o "%~dp0verification_results.txt"

echo Verification complete. Results saved to verification_results.txt
echo Opening results file...
start notepad "%~dp0verification_results.txt"
