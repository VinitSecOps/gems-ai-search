# GEMS AI Search - Enum Values Importer
# This script helps import enum values from the GEMS project into the search database

param (
    [Parameter(Mandatory=$true)]
    [string]$GemsCodePath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputSqlFile = "enum_mappings.sql"
)

# Create output directory if it doesn't exist
$outputDir = Split-Path -Parent $OutputSqlFile
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Initialize output SQL file
@"
-- Auto-generated enum mappings from GEMS project
-- Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

USE [GEMS-UAT]
GO

-- Clear existing mappings (optional, uncomment if needed)
-- DELETE FROM dbo.EnumMappings;
-- GO

"@ | Set-Content $OutputSqlFile

# Function to scan C# files for enums
function Find-EnumDefinitions {
    param (
        [string]$RootPath
    )
    
    $enumFiles = Get-ChildItem -Path $RootPath -Filter "*.cs" -Recurse | 
                 Where-Object { (Get-Content $_.FullName -Raw) -match "enum\s+\w+\s*{" }
    
    Write-Host "Found $($enumFiles.Count) potential enum files"
    
    $results = @()
    
    foreach ($file in $enumFiles) {
        $content = Get-Content $_.FullName -Raw
        
        # Extract namespace
        $namespaceMatch = [regex]::Match($content, "namespace\s+([\w\.]+)")
        $namespace = if ($namespaceMatch.Success) { $namespaceMatch.Groups[1].Value } else { "Unknown" }
        
        # Find all enum definitions in the file
        $enumMatches = [regex]::Matches($content, "(?:public\s+)?enum\s+(\w+)\s*{([^}]+)}")
        
        foreach ($enumMatch in $enumMatches) {
            $enumName = $enumMatch.Groups[1].Value
            $enumBody = $enumMatch.Groups[2].Value
            
            # Extract enum values
            $enumValues = @()
            $valueMatches = [regex]::Matches($enumBody, "(?:\s*)(\w+)(?:\s*=\s*(\d+))?")
            
            $autoValue = 0
            foreach ($valueMatch in $valueMatches) {
                $valueName = $valueMatch.Groups[1].Value
                $explicitValue = $valueMatch.Groups[2].Value
                
                if ($explicitValue) {
                    $value = [int]$explicitValue
                    $autoValue = $value + 1
                } else {
                    $value = $autoValue
                    $autoValue++
                }
                
                $enumValues += [PSCustomObject]@{
                    Name = $valueName
                    Value = $value
                }
            }
            
            $results += [PSCustomObject]@{
                EnumName = $enumName
                Namespace = $namespace
                Values = $enumValues
            }
        }
    }
    
    return $results
}

# Common status enums we're interested in
$targetEnums = @(
    "ClientStatus",
    "TimesheetStatus",
    "BookingStatus",
    "CandidateStatus",
    "RequirementStatus",
    "CompanyStatus"
)

Write-Host "Scanning GEMS code at $GemsCodePath"
$enums = Find-EnumDefinitions -RootPath $GemsCodePath

# Filter to the enums we're interested in
$filteredEnums = $enums | Where-Object { $targetEnums -contains $_.EnumName }

Write-Host "Found $($filteredEnums.Count) relevant enums"

# Generate SQL INSERT statements for each enum
foreach ($enum in $filteredEnums) {
    # Determine which table this enum applies to
    $tableName = switch -Wildcard ($enum.EnumName) {
        "*Client*" { "Clients" }
        "*Timesheet*" { "Timesheets" }
        "*Booking*" { "Bookings" }
        "*Candidate*" { "Candidates" }
        "*Requirement*" { "Requirements" }
        "*Company*" { "Company" }
        default { "Unknown" }
    }
    
    # Determine the column name
    $columnName = switch -Wildcard ($enum.EnumName) {
        "*Status*" { 
            if ($tableName -eq "Unknown") { "StatusId" } 
            else { $tableName.TrimEnd('s') + "StatusId" }
        }
        default { "StatusId" }
    }
    
    # Generate SQL for this enum
    @"
-- $($enum.EnumName) enum values from namespace $($enum.Namespace)
INSERT INTO [dbo].[EnumMappings] ([TableName], [ColumnName], [Value], [DisplayText], [Description])
VALUES
"@ | Add-Content $OutputSqlFile
    
    $valuesSql = $enum.Values | ForEach-Object {
        "('$tableName', '$columnName', $($_.Value), '$($_.Name)', 'Value $($_.Value) in $($enum.EnumName) enum')"
    }
    
    ($valuesSql -join ",`n") + ";`nGO`n" | Add-Content $OutputSqlFile
}

Write-Host "Finished generating enum mapping SQL at $OutputSqlFile"
Write-Host "Next steps:"
Write-Host "1. Review the generated SQL file"
Write-Host "2. Execute it against your database"
Write-Host "3. Update your application to use these mappings"
