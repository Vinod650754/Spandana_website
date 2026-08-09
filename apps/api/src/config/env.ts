import dotenv from "dotenv";

dotenv.config();

function parseFrontendOrigins(rawValue: string | undefined) {
  const defaults = ["http://localhost:3000", "https://spandana-seven.vercel.app"];
  const value = rawValue?.trim();

  if (!value) {
    return defaults;
  }

  const origins = value
    .split(",")
    .map((entry) => entry.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return origins.length > 0 ? origins : defaults;
}

const frontendUrls = parseFrontendOrigins(process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  databaseSsl: process.env.DATABASE_SSL ?? "auto",
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  frontendUrl: frontendUrls[0],
  frontendUrls,
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@spandana.edu.in",
  adminPassword: process.env.ADMIN_PASSWORD ?? "ChangeMe123!",
};
