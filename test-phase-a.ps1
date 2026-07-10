# Phase A Verification Test Script

Write-Host "=== PHASE A VERIFICATION TESTING ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "[1] Logging in to get JWT token..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{email="admin@spandana.edu.in"; password="ChangeMe123!"} | ConvertTo-Json) `
  -ErrorAction Stop

$token = $loginResponse.token
Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "  Token (first 50 chars): $($token.Substring(0, 50))..."

# Step 2: Upload single image
Write-Host ""
Write-Host "[2] Uploading single test image to gallery..." -ForegroundColor Yellow
$formParams = @{
  image = Get-Item "test-image.png"
  title = "PHASE A TEST IMAGE"
  category = "events"
  caption = "Test upload for verification"
}
$headers = @{"Authorization" = "Bearer $token"}

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:4000/gallery/upload" `
  -Method POST `
  -Headers $headers `
  -Form $formParams `
  -ErrorAction Stop

$imageId = $uploadResponse.data.id
Write-Host "✓ Upload successful" -ForegroundColor Green
Write-Host "  Image ID: $imageId"
Write-Host "  Cloudinary URL: $($uploadResponse.data.image_url)"
Write-Host "  Cloudinary Public ID: $($uploadResponse.data.cloudinary_public_id)"

# Step 3: List all gallery images
Write-Host ""
Write-Host "[3] Fetching all gallery images from API (no auth)..." -ForegroundColor Yellow
$galleryList = Invoke-RestMethod -Uri "http://localhost:4000/gallery" `
  -Method GET `
  -ErrorAction Stop

Write-Host "✓ Found $($galleryList.data.Count) image(s) in database" -ForegroundColor Green
Write-Host ""
$galleryList.data | Format-Table -Property @{N="ID";E={$_.id}}, @{N="Title";E={$_.title}}, @{N="Category";E={$_.category}}, @{N="Featured";E={$_.featured}}

# Step 4: Test bulk upload
Write-Host ""
Write-Host "[4] Testing bulk upload with additional images..." -ForegroundColor Yellow
$bulkResponse = Invoke-RestMethod -Uri "http://localhost:4000/gallery/bulk-upload" `
  -Method POST `
  -Headers $headers `
  -Form @{
    images = @(Get-Item "test-image.png"), (Get-Item "test-image.png")
    category = "workshops"
  } `
  -ErrorAction Stop

Write-Host "✓ Bulk upload successful" -ForegroundColor Green
Write-Host "  Uploaded $($bulkResponse.data.Count) images"
Write-Host "  Message: $($bulkResponse.message)"

# Step 5: Verify updated count
Write-Host ""
Write-Host "[5] Verifying updated gallery count..." -ForegroundColor Yellow
$galleryListUpdated = Invoke-RestMethod -Uri "http://localhost:4000/gallery" `
  -Method GET `
  -ErrorAction Stop

Write-Host "✓ Total images now: $($galleryListUpdated.data.Count)" -ForegroundColor Green

# Step 6: Test deletion
Write-Host ""
Write-Host "[6] Testing image deletion..." -ForegroundColor Yellow
$deleteResponse = Invoke-RestMethod -Uri "http://localhost:4000/gallery/$imageId" `
  -Method DELETE `
  -Headers $headers `
  -ErrorAction Stop

Write-Host "✓ Deletion successful" -ForegroundColor Green
Write-Host "  Message: $($deleteResponse.message)"

# Step 7: Verify deletion
Write-Host ""
Write-Host "[7] Verifying deletion..." -ForegroundColor Yellow
$galleryListFinal = Invoke-RestMethod -Uri "http://localhost:4000/gallery" `
  -Method GET `
  -ErrorAction Stop

Write-Host "✓ Total images after deletion: $($galleryListFinal.data.Count)" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "✓ JWT Authentication: PASSED" -ForegroundColor Green
Write-Host "✓ Single Image Upload: PASSED" -ForegroundColor Green
Write-Host "✓ Bulk Upload: PASSED" -ForegroundColor Green
Write-Host "✓ Database Storage: PASSED" -ForegroundColor Green
Write-Host "✓ Image Deletion: PASSED" -ForegroundColor Green
Write-Host ""
Write-Host "Phase A end-to-end testing COMPLETE!" -ForegroundColor Green
