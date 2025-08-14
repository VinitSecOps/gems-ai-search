# check_sql_scripts.ps1
# Script to check SQL scripts for potential issues

# Define the SQL Server instance and database
$SQLInstance = "localhost"
$Database = "GEMS-UAT"

# Function to check if a table exists
function Test-TableExists {
    param (
        [string]$TableName
    )
    
    $query = @"
    IF OBJECT_ID(N'[$TableName]', N'U') IS NOT NULL
        SELECT 1 AS Result
    ELSE
        SELECT 0 AS Result
"@

    $result = Invoke-Sqlcmd -ServerInstance $SQLInstance -Database $Database -Query $query
    return $result.Result -eq 1
}

# Function to check if a column exists in a table
function Test-ColumnExists {
    param (
        [string]$TableName,
        [string]$ColumnName
    )
    
    $query = @"
    IF EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '$TableName' AND COLUMN_NAME = '$ColumnName'
    )
        SELECT 1 AS Result
    ELSE
        SELECT 0 AS Result
"@

    $result = Invoke-Sqlcmd -ServerInstance $SQLInstance -Database $Database -Query $query
    return $result.Result -eq 1
}

Write-Host "GEMS AI Search SQL Script Validation" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host

# Check if required tables exist
$tables = @("Company", "Clients", "Sites", "Candidates", "CostCentres", "Timesheets", "Bookings")
Write-Host "Checking required tables..." -ForegroundColor Yellow

foreach ($table in $tables) {
    $exists = Test-TableExists -TableName $table
    if ($exists) {
        Write-Host "  [✓] Table $table exists" -ForegroundColor Green
    } else {
        Write-Host "  [✗] Table $table does not exist!" -ForegroundColor Red
        Write-Host "      This might cause errors in the search_enhancements.sql script." -ForegroundColor Red
    }
}

Write-Host

# Check columns referenced in the vw_SearchCommonEntities view
Write-Host "Checking columns used in the vw_SearchCommonEntities view..." -ForegroundColor Yellow

$columnsToCheck = @(
    @{Table="Company"; Column="CompanyName"},
    @{Table="Company"; Column="IsActive"},
    @{Table="Clients"; Column="Name"},
    @{Table="Clients"; Column="ClientStatusId"},
    @{Table="Clients"; Column="CompanyId"},
    @{Table="Sites"; Column="Name"},
    @{Table="Sites"; Column="ClientId"},
    @{Table="Candidates"; Column="FirstName"},
    @{Table="Candidates"; Column="Surname"},
    @{Table="Candidates"; Column="CompanyId"},
    @{Table="CostCentres"; Column="Name"},
    @{Table="CostCentres"; Column="CompanyId"}
)

foreach ($item in $columnsToCheck) {
    $exists = Test-ColumnExists -TableName $item.Table -ColumnName $item.Column
    if ($exists) {
        Write-Host "  [✓] Column $($item.Table).$($item.Column) exists" -ForegroundColor Green
    } else {
        Write-Host "  [✗] Column $($item.Table).$($item.Column) does not exist!" -ForegroundColor Red
        Write-Host "      This might cause errors in the vw_SearchCommonEntities view creation." -ForegroundColor Red
    }
}

Write-Host

# Check if the CreatedDate column exists in any tables (this was replaced with GETDATE())
Write-Host "Checking CreatedDate columns (replaced with GETDATE())..." -ForegroundColor Yellow

foreach ($table in $tables) {
    $exists = Test-ColumnExists -TableName $table -ColumnName "CreatedDate"
    if ($exists) {
        Write-Host "  [✓] Column $table.CreatedDate exists" -ForegroundColor Green
    } else {
        Write-Host "  [i] Column $table.CreatedDate does not exist" -ForegroundColor Yellow
        Write-Host "      This is expected - using GETDATE() instead in the view." -ForegroundColor Yellow
    }
}

Write-Host
Write-Host "SQL script validation complete." -ForegroundColor Cyan
Write-Host "Check the results above for any potential issues that need to be addressed." -ForegroundColor Cyan

# Pause at the end to see results
Write-Host
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
