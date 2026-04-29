# Load the necessary .NET assembly
Add-Type -AssemblyName System.Drawing

# Set the source file and verify it exists
$sourceFileName = "baraja.png" # Make sure this matches your file name
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$sourcePath = Join-Path $scriptPath $sourceFileName

if (!(Test-Path $sourcePath)) {
    Write-Error "Source file not found at $sourcePath. Please check the filename."
    return
}

# Configuration
$outputDir = Join-Path $scriptPath "cards_output"
$rows = 4
$cols = 13

# Create output directory if it doesn't exist
if (!(Test-Path $outputDir)) { 
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null 
}

# Load the master image
$masterImg = [System.Drawing.Image]::FromFile($sourcePath)

# Use [Math]::Floor to avoid sub-pixel rendering issues
$cardWidth = [Math]::Floor($masterImg.Width / $cols)
$cardHeight = [Math]::Floor($masterImg.Height / $rows)

$suits = @("Oros", "Copas", "Espadas", "Bastos")

Write-Host "Starting export to: $outputDir" -ForegroundColor Cyan

try {
    for ($r = 0; $r -lt $rows; $r++) {
        for ($c = 0; $c -lt $cols; $c++) {
            
            # Logic: Skip 8s (col 7) and 9s (col 8) to get a 40-card deck
            # And skip the very last column (index 12) which is the back
            $cardNum = $c + 1
            if (($cardNum -le 7 -or $cardNum -ge 10) -and $cardNum -le 12) {
                
                $cardBmp = New-Object System.Drawing.Bitmap([int]$cardWidth, [int]$cardHeight)
                $graphics = [System.Drawing.Graphics]::FromImage($cardBmp)

                $srcRect = New-Object System.Drawing.Rectangle([int]($c * ($masterImg.Width / $cols)), [int]($r * ($masterImg.Height / $rows)), [int]$cardWidth, [int]$cardHeight)
                $destRect = New-Object System.Drawing.Rectangle(0, 0, [int]$cardWidth, [int]$cardHeight)

                $graphics.DrawImage($masterImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

                # Naming Logic: 10=Sota, 11=Caballo, 12=Rey
                $fileName = "$($suits[$r])_$($cardNum).png"
                $savePath = Join-Path $outputDir $fileName

                try {
                    $cardBmp.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
                    Write-Host "Saved: $fileName"
                }
                catch {
                    Write-Warning "Failed to save $fileName. Error: $_"
                }

                # Clean up individual card resources
                $graphics.Dispose()
                $cardBmp.Dispose()
            }
        }
    }
}
finally {
    # Ensure the master image is released even if the script crashes
    $masterImg.Dispose()
    Write-Host "Process complete." -ForegroundColor Green
}