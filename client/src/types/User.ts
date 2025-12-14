export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string;
}

export interface ResumeTemplateData {
    _id: string;
  reportId: string;
  resumeUrl: string;
  resumeName: string;
  createdAt: string;
  score: number;
  analysis: {
    ats_score: number;
    suggestions: string[];
    repeated_phrases: string[];
    buzzwords: string[];
    action_verbs: string[];
    missing_sections: string[];
    tone_analysis: string;
    verdict_summary: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    role: string;
  };
}



/* ---------------- OTP Types ---------------- */

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/** Payload for sending OTP */
export interface SendOtpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Payload for verifying OTP */
export interface VerifyOtpPayload {
  email?: string;
  phone?: string;
  otp: string;
}

/** Backend response for OTP verification */
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string; // useful if verification logs in the user
}
