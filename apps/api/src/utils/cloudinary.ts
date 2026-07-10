import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  [key: string]: any;
}

export async function uploadImage(file: Buffer, filename: string, folder: string, uploadPreset?: string): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `spandana/${folder}`,
        public_id: filename.replace(/\.[^/.]+$/, ""),
        resource_type: "auto",
        upload_preset: uploadPreset,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as CloudinaryUploadResult);
      }
    );

    uploadStream.end(file);
  });
}

export async function deleteImage(publicId: string) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export async function listImages(folder: string) {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: `spandana/${folder}`,
    max_results: 500,
  });

  return result;
}

export async function transformImageUrl(publicId: string, width?: number, height?: number, quality: string = "auto") {
  const url = cloudinary.url(publicId, {
    width,
    height,
    crop: "fill",
    quality,
    fetch_format: "auto",
  });

  return url;
}
