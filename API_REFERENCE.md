# Upload API Reference - Phase A

## Base URL
```
http://localhost:4000
```

## Authentication
All upload endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get JWT Token
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spandana.edu.in",
    "password": "ChangeMe123!"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "sub": "user-id",
    "role": "admin",
    "email": "admin@spandana.edu.in"
  }
}
```

---

## 📸 Gallery Endpoints

### GET /gallery
List all gallery images

**Request:**
```bash
curl http://localhost:4000/gallery
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Event Photo",
      "caption": "Beautiful moment",
      "category": "events",
      "image_url": "https://res.cloudinary.com/...",
      "cloudinary_public_id": "spandana/gallery/...",
      "width": 1920,
      "height": 1080,
      "featured": false,
      "sort_order": 0,
      "created_at": "2026-06-20T10:30:00Z"
    }
  ]
}
```

---

### POST /gallery/upload
Upload single gallery image

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:4000/gallery/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "title=My Event Photo" \
  -F "category=events" \
  -F "caption=Optional caption"
```

**Form Fields:**
- `image` (file) - **Required** - Image file
- `title` (string) - **Required** - Min 2 characters
- `category` (string) - **Required** - Min 2 characters
  - Suggested: `events`, `workshops`, `community`, `fundraisers`, `team`, `uncategorized`
- `caption` (string) - Optional - Description

**Response (201):**
```json
{
  "message": "Image uploaded successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My Event Photo",
    "image_url": "https://res.cloudinary.com/vinod0717/image/upload/v1719000000/spandana/gallery/...",
    "cloudinary_public_id": "spandana/gallery/..."
  }
}
```

---

### POST /gallery/bulk-upload
Upload up to 50 images at once

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:4000/gallery/bulk-upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg" \
  -F "category=workshops"
```

**Form Fields:**
- `images` (file) - **Required** - Multiple image files (max 50)
- `category` (string) - Optional - Default: `uncategorized`

**Response (201):**
```json
{
  "message": "Successfully uploaded 3 images.",
  "data": [
    {
      "id": "uuid-1",
      "title": "image1.jpg",
      "image_url": "https://res.cloudinary.com/..."
    },
    {
      "id": "uuid-2",
      "title": "image2.jpg",
      "image_url": "https://res.cloudinary.com/..."
    },
    {
      "id": "uuid-3",
      "title": "image3.jpg",
      "image_url": "https://res.cloudinary.com/..."
    }
  ]
}
```

---

### PUT /gallery/:id/tag
Update category and featured status

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X PUT http://localhost:4000/gallery/550e8400-e29b-41d4-a716-446655440000/tag \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "community",
    "featured": true
  }'
```

**Request Body:**
- `category` (string) - New category
- `featured` (boolean) - Highlight in gallery

**Response (200):**
```json
{
  "message": "Image tagged successfully."
}
```

---

### PUT /gallery/:id/reorder
Change sort order of image

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X PUT http://localhost:4000/gallery/550e8400-e29b-41d4-a716-446655440000/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sortOrder": 5
  }'
```

**Request Body:**
- `sortOrder` (number) - Display position (0-based)

**Response (200):**
```json
{
  "message": "Image reordered successfully."
}
```

---

### DELETE /gallery/:id
Delete image from gallery and Cloudinary

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X DELETE http://localhost:4000/gallery/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200):**
```json
{
  "message": "Image deleted successfully."
}
```

---

## 🎬 Event Endpoints

### GET /events
List all events

**Request:**
```bash
curl http://localhost:4000/events
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "blood-donation-drive",
      "title": "Blood Donation Drive",
      "description": "Community service initiative...",
      "venue": "SMVIT Auditorium",
      "event_date": "2026-12-15T10:00:00Z",
      "status": "upcoming",
      "banner_url": "https://res.cloudinary.com/...",
      "gallery": [],
      "featured": false,
      "created_at": "2026-06-20T10:00:00Z"
    }
  ]
}
```

---

### POST /events
Create new event with optional banner

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:4000/events \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Hackathon 2026" \
  -F "description=Annual hackathon for innovative solutions in social tech" \
  -F "venue=SMVIT Main Hall" \
  -F "eventDate=2026-12-20T09:00:00Z" \
  -F "status=upcoming" \
  -F "slug=hackathon-2026" \
  -F "banner=@banner.jpg"
```

**Form Fields:**
- `title` (string) - **Required** - Min 2 chars
- `description` (string) - **Required** - Min 20 chars
- `venue` (string) - **Required** - Min 2 chars
- `eventDate` (datetime) - **Required** - ISO 8601 format
- `status` (enum) - **Required** - `upcoming`, `ongoing`, `completed`
- `slug` (string) - **Required** - URL-friendly identifier
- `banner` (file) - Optional - Event banner image

**Response (201):**
```json
{
  "message": "Event created successfully.",
  "data": {
    "id": "event-uuid",
    "slug": "hackathon-2026",
    "title": "Hackathon 2026",
    "banner_url": "https://res.cloudinary.com/..."
  }
}
```

---

### GET /events/:slug
Get event details

**Request:**
```bash
curl http://localhost:4000/events/hackathon-2026
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "slug": "hackathon-2026",
    "title": "Hackathon 2026",
    "description": "...",
    "venue": "SMVIT Main Hall",
    "event_date": "2026-12-20T09:00:00Z",
    "status": "upcoming",
    "banner_url": "https://res.cloudinary.com/...",
    "gallery": [
      {
        "url": "https://res.cloudinary.com/...",
        "public_id": "spandana/events/...",
        "uploaded_at": "2026-06-20T11:00:00Z"
      }
    ]
  }
}
```

---

### PUT /events/:slug
Update event details

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X PUT http://localhost:4000/events/hackathon-2026 \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Hackathon 2026 - Updated" \
  -F "description=Enhanced hackathon with more prizes" \
  -F "venue=SMVIT Auditorium" \
  -F "eventDate=2026-12-21T09:00:00Z" \
  -F "status=upcoming" \
  -F "slug=hackathon-2026"
```

**Response (200):**
```json
{
  "message": "Event updated successfully."
}
```

---

### POST /events/:slug/gallery
Add images to event gallery (max 20)

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:4000/events/hackathon-2026/gallery \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "images=@photo3.jpg"
```

**Form Fields:**
- `images` (file) - **Required** - Multiple images (max 20)

**Response (201):**
```json
{
  "message": "Added 3 images to event gallery."
}
```

---

### DELETE /events/:slug
Delete event

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X DELETE http://localhost:4000/events/hackathon-2026 \
  -H "Authorization: Bearer $TOKEN"
```

**Response (204):**
```
(No content)
```

---

## 👥 Team Endpoints

### GET /team
List all team members

**Request:**
```bash
curl http://localhost:4000/team
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "Club President",
      "category": "student",
      "photo_url": "https://res.cloudinary.com/...",
      "social": {
        "email": "john@example.com",
        "linkedin": "https://linkedin.com/in/john",
        "twitter": "https://twitter.com/john"
      },
      "featured": false,
      "created_at": "2026-06-20T10:00:00Z"
    }
  ]
}
```

---

### POST /team
Add team member with optional photo

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:4000/team \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Jane Smith" \
  -F "role=Tech Lead" \
  -F "category=student" \
  -F "photo=@profile.jpg" \
  -F "social={\"email\":\"jane@example.com\",\"linkedin\":\"https://linkedin.com/in/jane\"}"
```

**Form Fields:**
- `name` (string) - **Required** - Min 2 chars
- `role` (string) - **Required** - Min 2 chars
- `category` (enum) - **Required** - `faculty` or `student`
- `photo` (file) - Optional - Profile photo
- `social` (JSON string) - Optional - Social links

**Response (201):**
```json
{
  "message": "Team member added successfully.",
  "data": {
    "id": "member-uuid",
    "name": "Jane Smith",
    "role": "Tech Lead",
    "category": "student",
    "photo_url": "https://res.cloudinary.com/..."
  }
}
```

---

### PUT /team/:id
Update team member

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X PUT http://localhost:4000/team/member-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Jane Smith" \
  -F "role=Senior Tech Lead" \
  -F "category=student" \
  -F "photo=@new-profile.jpg" \
  -F "social={\"email\":\"jane.smith@example.com\"}"
```

**Response (200):**
```json
{
  "message": "Team member updated successfully."
}
```

---

### DELETE /team/:id
Remove team member

**Request:**
```bash
TOKEN="your_jwt_token"
curl -X DELETE http://localhost:4000/team/member-uuid \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200):**
```json
{
  "message": "Team member removed successfully."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid upload metadata.",
  "issues": {
    "fieldErrors": {
      "title": ["String must contain at least 2 character(s)"]
    }
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Image not found."
}
```

### 500 Server Error
```json
{
  "message": "Failed to upload image."
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success, no response body) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

---

## PowerShell Script for Testing

Save as `test-uploads.ps1`:

```powershell
$baseUrl = "http://localhost:4000"
$email = "admin@spandana.edu.in"
$password = "ChangeMe123!"

# Login
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{email=$email; password=$password} | ConvertTo-Json)

$token = $loginResponse.token
$headers = @{"Authorization" = "Bearer $token"}

# Upload gallery image
$imageFile = "C:\path\to\image.jpg"
$form = @{
  image = Get-Item $imageFile
  title = "Test Image"
  category = "events"
  caption = "Testing upload"
}

$uploadResponse = Invoke-RestMethod -Uri "$baseUrl/gallery/upload" `
  -Method POST `
  -Headers $headers `
  -Form $form

Write-Host "Upload successful!"
Write-Host ($uploadResponse | ConvertTo-Json -Depth 3)

# List galleries
$galleryResponse = Invoke-RestMethod -Uri "$baseUrl/gallery" -Method GET
Write-Host "Gallery images: $($galleryResponse.data.Count)"
```

---

## Resources

- **Cloudinary Dashboard**: https://cloudinary.com/console/
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
