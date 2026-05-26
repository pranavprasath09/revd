const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate a file for image upload.
 * Throws a descriptive Error if validation fails.
 */
export function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Only JPEG, PNG, and WebP are allowed.`);
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Invalid file extension ".${ext}". Only .jpg, .jpeg, .png, and .webp are allowed.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" exceeds the 10 MB limit.`);
  }
}
