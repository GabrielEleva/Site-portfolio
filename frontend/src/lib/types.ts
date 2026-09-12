export interface Video {
  id: string;
  title: string;
  category: string;
  client: string;
  duration: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  featured: boolean;
  aspect_ratio: string;
  created_at: string;
}

export interface VideoInput {
  title: string;
  category: string;
  client: string;
  duration: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  featured: boolean;
  aspect_ratio: string;
  pin: string;
}

export interface BrandSettings {
  logo_url: string | null;
  updated_at: string;
}

export interface AuthResponse {
  authenticated: boolean;
  message: string;
}

export interface MediaUpload {
  url: string;
  filename: string;
  size_bytes: number;
  content_type: string;
}

export interface Photo {
  id: string;
  title: string;
  category: string;
  image_url: string;
  alt: string;
  created_at: string;
}

export interface PhotoInput {
  title: string;
  category: string;
  image_url: string;
  alt: string;
  pin: string;
}