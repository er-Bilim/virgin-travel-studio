import type {IMAGE_UPLOAD} from '@/lib/constants';

export type AllowedImageMimeType = (typeof IMAGE_UPLOAD.ALLOWED_MIME_TYPES)[number];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}