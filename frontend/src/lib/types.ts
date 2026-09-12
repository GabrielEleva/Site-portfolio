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
  hero_eyebrow: string;
  hero_title: string;
  hero_footer: string;
  about_label: string;
  about_title: string;
  about_description: string;
  about_highlight: string;
  service_events_title: string;
  service_events_description: string;
  service_commercials_title: string;
  service_commercials_description: string;
  service_drone_title: string;
  service_drone_description: string;
  portfolio_label: string;
  portfolio_title: string;
  portfolio_description: string;
  gallery_label: string;
  gallery_title: string;
  gallery_description: string;
  contact_label: string;
  contact_title: string;
  contact_description: string;
  contact_button_label: string;
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