@echo off
echo GEMS AI Search Enhancement Deployment Script
echo =========================================

REM Set your SQL Server instance name here
set SERVER=localhost
set DATABASE=GEMS-UAT

echo Running on Server: %SERVER%, Database: %DATABASE%

echo.
echo Step 1: Running search_enhancements.sql...
sqlcmd -S %SERVER% -d %DATABASE% -E -i "%~dp0schema\search_enhancements.sql"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: search_enhancements.sql execution failed!
    goto :error
) else (
    echo search_enhancements.sql executed successfully.
)

echo.
echo Step 2: Running enum_mappings.sql...
sqlcmd -S %SERVER% -d %DATABASE% -E -i "%~dp0schema\enum_mappings.sql"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: enum_mappings.sql execution failed!
    goto :error
) else (
    echo enum_mappings.sql executed successfully.
)

echo.
echo Step 3: Verifying the deployment...
sqlcmd -S %SERVER% -d %DATABASE% -E -i "%~dp0verify_enhancements.sql" -o "%~dp0verification_results.txt"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Verification script execution failed!
    goto :error
) else (
    echo Verification completed. Results saved to verification_results.txt
    echo Opening verification results...
    start notepad "%~dp0verification_results.txt"
)

echo.
echo Deployment completed successfully!
echo Please check the verification results to ensure all objects were created correctly.
goto :end

:error
echo.
echo Deployment encountered errors. Please check the output above.
exit /b 1

:end
echo.
echo Press any key to exit...
pause > nul
