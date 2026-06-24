Get-ChildItem img_*.png | ForEach-Object {
    $bytes = Get-Content $_.FullName -Encoding Byte -TotalCount 8
    $hex = [BitConverter]::ToString($bytes)
    Write-Output ($_.Name + " : " + $hex)
}
