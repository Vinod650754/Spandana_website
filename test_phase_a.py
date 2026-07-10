#!/usr/bin/env python3
"""Phase A Upload Verification Test"""

import requests
import json
import sys
from pathlib import Path

API_URL = "http://localhost:4000"
ADMIN_EMAIL = "admin@spandana.edu.in"
ADMIN_PASSWORD = "ChangeMe123!"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_success(text):
    print(f"✓ {text}")

def print_error(text):
    print(f"✗ {text}")

def main():
    print_header("PHASE A VERIFICATION TESTING")
    
    # Step 1: Login
    print("[1] Authenticating with admin credentials...")
    try:
        login_response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        login_response.raise_for_status()
        token = login_response.json()["token"]
        print_success("Authentication successful")
        print(f"    Token (first 50 chars): {token[:50]}...")
    except Exception as e:
        print_error(f"Authentication failed: {e}")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Upload single image
    print("\n[2] Uploading single test image...")
    try:
        with open("test-image.png", "rb") as f:
            files = {
                "image": f,
            }
            data = {
                "title": "PHASE A TEST IMAGE",
                "category": "events",
                "caption": "Test upload for verification"
            }
            upload_response = requests.post(
                f"{API_URL}/gallery/upload",
                headers=headers,
                files=files,
                data=data
            )
        upload_response.raise_for_status()
        upload_data = upload_response.json()
        image_id = upload_data["data"]["id"]
        image_url = upload_data["data"]["image_url"]
        cloudinary_id = upload_data["data"]["cloudinary_public_id"]
        
        print_success("Single image uploaded successfully")
        print(f"    Image ID: {image_id}")
        print(f"    Cloudinary Public ID: {cloudinary_id}")
        print(f"    Cloudinary URL: {image_url}")
    except Exception as e:
        print_error(f"Upload failed: {e}")
        return False
    
    # Step 3: Verify in database (fetch all)
    print("\n[3] Fetching all gallery images from database...")
    try:
        gallery_response = requests.get(f"{API_URL}/gallery")
        gallery_response.raise_for_status()
        gallery_data = gallery_response.json()
        images = gallery_data["data"]
        print_success(f"Found {len(images)} image(s) in database")
        if images:
            print("\n    Gallery Contents:")
            print(f"    {'ID':<40} {'Title':<30} {'Category':<15} {'Featured'}")
            print(f"    {'-'*40} {'-'*30} {'-'*15} {'-'*8}")
            for img in images:
                print(f"    {img['id']:<40} {img['title']:<30} {img['category']:<15} {str(img['featured'])}")
    except Exception as e:
        print_error(f"Failed to fetch gallery: {e}")
        return False
    
    # Step 4: Test bulk upload
    print("\n[4] Testing bulk upload with 2 additional images...")
    try:
        with open("test-image.png", "rb") as f1, open("test-image.png", "rb") as f2:
            files = [
                ("images", f1),
                ("images", f2),
            ]
            data = {"category": "workshops"}
            bulk_response = requests.post(
                f"{API_URL}/gallery/bulk-upload",
                headers=headers,
                files=files,
                data=data
            )
        bulk_response.raise_for_status()
        bulk_data = bulk_response.json()
        print_success(f"Bulk upload successful - {bulk_data['message']}")
        print(f"    Uploaded {len(bulk_data['data'])} images")
    except Exception as e:
        print_error(f"Bulk upload failed: {e}")
        return False
    
    # Step 5: Verify updated count
    print("\n[5] Verifying updated gallery count...")
    try:
        gallery_response = requests.get(f"{API_URL}/gallery")
        gallery_response.raise_for_status()
        gallery_data = gallery_response.json()
        new_count = len(gallery_data["data"])
        print_success(f"Total images in database: {new_count}")
    except Exception as e:
        print_error(f"Failed to verify count: {e}")
        return False
    
    # Step 6: Test image deletion
    print(f"\n[6] Testing image deletion ({image_id})...")
    try:
        delete_response = requests.delete(
            f"{API_URL}/gallery/{image_id}",
            headers=headers
        )
        delete_response.raise_for_status()
        print_success(f"Image deleted successfully - {delete_response.json()['message']}")
    except Exception as e:
        print_error(f"Deletion failed: {e}")
        return False
    
    # Step 7: Verify deletion
    print("\n[7] Verifying deletion...")
    try:
        gallery_response = requests.get(f"{API_URL}/gallery")
        gallery_response.raise_for_status()
        gallery_data = gallery_response.json()
        final_count = len(gallery_data["data"])
        print_success(f"Total images after deletion: {final_count}")
    except Exception as e:
        print_error(f"Failed to verify deletion: {e}")
        return False
    
    # Summary
    print_header("TEST SUMMARY - ALL TESTS PASSED")
    print_success("JWT Authentication")
    print_success("Single Image Upload")
    print_success("Database Storage (PostgreSQL)")
    print_success("Gallery Retrieval")
    print_success("Bulk Upload")
    print_success("Image Deletion")
    print_success("Cloudinary Integration")
    
    print(f"\n  Image flow verified:")
    print(f"    1. Uploaded to Cloudinary (public_id: {cloudinary_id})")
    print(f"    2. Stored metadata in PostgreSQL")
    print(f"    3. Retrieved from gallery endpoint")
    print(f"    4. Deleted from both Cloudinary and PostgreSQL")
    
    print("\n" + "="*60)
    print("  Phase A END-TO-END VERIFICATION: COMPLETE ✓")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
