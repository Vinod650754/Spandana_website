@echo off
REM Phase A Verification Test Script
echo.
echo ===  PHASE A VERIFICATION TESTING  ===
echo.

REM Step 1: Login
echo [1] Logging in...
for /f "tokens=*" %%A in ('curl -s -X POST http://localhost:4000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@spandana.edu.in\",\"password\":\"ChangeMe123!\"}" ^
  ^| findstr /R "token' ') > nul && (
  for /f "tokens=*" %%B in ('curl -s -X POST http://localhost:4000/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"admin@spandana.edu.in\",\"password\":\"ChangeMe123!\"}" ^
    ^| powershell -Command "$input | ConvertFrom-Json | Select-Object -ExpandProperty token"') do (
    set TOKEN=%%B
  )
)

echo Login Check: Looking for token...
REM Try to get token with PowerShell
for /f "tokens=*" %%A in ('powershell -Command "
$response = Invoke-RestMethod -Uri 'http://localhost:4000/auth/login' -Method POST -ContentType 'application/json' -Body (@{email='admin@spandana.edu.in'; password='ChangeMe123!'} ^| ConvertTo-Json)
Write-Host $response.token
"') do (
  set TOKEN=%%A
)

if "%TOKEN%"=="" (
  echo ERROR: Could not login
  exit /b 1
)

echo Login successful
echo Token: %TOKEN%
echo.

REM Step 2: Upload single image
echo [2] Uploading test image...
curl -X POST http://localhost:4000/gallery/upload ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "image=@test-image.png" ^
  -F "title=PHASE A TEST IMAGE" ^
  -F "category=events" ^
  -F "caption=Test upload for verification"

echo.
echo [3] Fetching gallery list...
curl -X GET http://localhost:4000/gallery

echo.
echo Testing complete!
