// types/profile.ts
export interface UserProfile {
  user_id: string;
  name: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
  avatar_url: string | null;
  avatar_urls?: {
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  privacy_settings: {
    profile_visible: boolean;
    email_visible: boolean;
    phone_visible: boolean;
  };
}

export interface UpdateProfilePayload {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  privacy_settings?: {
    profile_visible: boolean;
    email_visible: boolean;
    phone_visible: boolean;
  };
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileResponse {
  message: string;
  profile: UserProfile;
}

export interface AvatarUploadResponse {
  message: string;
  avatar: {
    avatar_url: string;
    avatar_path: string;
    avatar_urls: {
      small: string;
      medium: string;
      large: string;
      original: string;
    };
    upload_info: {
      width: number;
      height: number;
      size: number;
      format: string;
    };
  };
}