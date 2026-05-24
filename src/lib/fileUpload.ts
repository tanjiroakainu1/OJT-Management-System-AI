export const REQUIREMENT_ACCEPT =
  'application/pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp';

export const PROFILE_PHOTO_ACCEPT =
  'image/jpeg,image/jpg,image/png,image/gif,image/webp';

export const MAX_REQUIREMENT_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_PROFILE_PHOTO_BYTES = 1024 * 1024; // 1 MB

const PROFILE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export function isRequirementDataUrl(path: string): boolean {
  return path.startsWith('data:');
}

export function isImageDataUrl(path: string): boolean {
  return path.startsWith('data:image/');
}

export function isPdfDataUrl(path: string): boolean {
  return path.startsWith('data:application/pdf');
}

export function getRequirementDisplayName(fileName?: string | null, filePath?: string): string {
  if (fileName?.trim()) return fileName.trim();
  if (!filePath) return 'Uploaded file';
  if (isRequirementDataUrl(filePath)) return 'Uploaded file';
  return filePath;
}

export function validateRequirementFile(file: File): string | null {
  const type = file.type.toLowerCase();
  if (!ALLOWED_TYPES.has(type)) {
    return 'Only PDF or image files (JPG, PNG, GIF, WebP) are allowed.';
  }
  if (file.size > MAX_REQUIREMENT_FILE_BYTES) {
    return 'File must be 2 MB or smaller.';
  }
  return null;
}

export function validateProfilePhoto(file: File): string | null {
  const type = file.type.toLowerCase();
  if (!PROFILE_TYPES.has(type)) {
    return 'Only image files (JPG, PNG, GIF, WebP) are allowed for profile photos.';
  }
  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    return 'Profile photo must be 1 MB or smaller.';
  }
  return null;
}

export function readProfilePhoto(file: File): Promise<string> {
  const error = validateProfilePhoto(file);
  if (error) return Promise.reject(new Error(error));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read photo.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read photo.'));
    reader.readAsDataURL(file);
  });
}

export function readRequirementFile(
  file: File
): Promise<{ dataUrl: string; fileName: string }> {
  const error = validateRequirementFile(file);
  if (error) return Promise.reject(new Error(error));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read file.'));
        return;
      }
      resolve({ dataUrl: reader.result, fileName: file.name });
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}
