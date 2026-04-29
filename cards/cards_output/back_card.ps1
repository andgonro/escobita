Add-Type -AssemblyName System.Drawing
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$sourcePath = Join-Path $scriptPath "baraja.png"
$outputDir = Join-Path $scriptPath "cards_output"

$masterImg = [System.Drawing.Image]::FromFile($sourcePath)

$cardWidth = [Math]::Floor($masterImg.Width / 13)
$cardHeight = [Math]::Floor($masterImg.Height / 4)

# The back is in the top-right corner (Row 0, Column 12)
$cardBmp = New-Object System.Drawing.Bitmap([int]$cardWidth, [int]$cardHeight)
$graphics = [System.Drawing.Graphics]::FromImage($cardBmp)

$srcRect = New-Object System.Drawing.Rectangle([int](12 * ($masterImg.Width / 13)), 0, [int]$cardWidth, [int]$cardHeight)
$destRect = New-Object System.Drawing.Rectangle(0, 0, [int]$cardWidth, [int]$cardHeight)

$graphics.DrawImage($masterImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$cardBmp.Save((Join-Path $outputDir "Card_Back.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$cardBmp.Dispose()
$masterImg.Dispose()

Write-Host "Backside card saved to cards_output\Card_Back.png" -ForegroundColor Green