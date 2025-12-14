
import  type {  ResumeTemplateData ,  ApiResponse, User} from "./User"



export type AdminUsersResponse = ApiResponse<User[]>;
export type AdminResumesResponse = ApiResponse<ResumeTemplateData[]>;

export interface AdminState {
  users: User[];
  resumes: ResumeTemplateData[];
  reports: ResumeTemplateData[];
  selectedUser?: User | null;
  selectedResume?: ResumeTemplateData | null;
  selectedReport?: ResumeTemplateData | null;
  loadingUsers: boolean;
  loadingResumes: boolean;
  loadingReports: boolean;
  error: string | null;
}


export interface UpdateUserPayload {
  id: string;
  role?: "admin" | "user";
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface DeleteUserPayload {
  id: string;
}

export interface DeleteResumePayload {
  id: string;
}
