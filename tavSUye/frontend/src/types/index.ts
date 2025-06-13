export interface User {
  userId: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  firstName?: string;
  lastName?: string;
  role: string;
  major?: string;
  minor?: string;
  secondMajor?: string;
  startTerm?: number;
  graduationTerm?: number;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  is2FAEnabled: boolean;
  emailVerified: boolean;
  fullName?: string;
  isBanned?: boolean;
  password?: string;
}

export interface Course {
  courseId: number;
  subject: string;
  courseCode: string;
  courseNameEn: string;
  courseNameTr: string;
  suCredit: number;
  ectsCredit: number;
  engineeringEcts?: number;
  basicScienceEcts?: number;
  contentEn?: string;
  contentTr?: string;
  linkEn?: string;
  linkTr?: string;
  faculty?: 'FENS' | 'FASS' | 'SL' | 'FMAN';
  courseStatus: boolean;
}

export interface CourseComment {
  commentId: number;
  userId: number;
  username: string;
  courseId: number;
  parentCommentId: number | null;
  termTaken: number | null;
  gradeReceived: string | null;
  content: string;
  createdAt: string;
  anonymous: boolean;
  
  // Legacy fields for compatibility with existing components
  rating?: number;
  difficulty?: number;
  attendance?: 'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL';
  textbook?: 'REQUIRED' | 'RECOMMENDED' | 'NOT_REQUIRED';
  grade?: string;
  term?: string;
  likes?: number;
  dislikes?: number;
  isReported?: boolean;
  reportCount?: number;
}

export interface CourseCommentRating {
  likes: number;
  dislikes: number;
}

export interface CourseViewLog {
  courseId: number;
  subject: string;
  courseCode: string;
  visitCount: number;
}

export interface Instructor {
  instructorId: number;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  email: string;
  website?: string;
  office?: string;
  profileImage?: string;
  name?: string;
  surname?: string;
  imageUrl?: string;
  aboutTr?: string;
  aboutEn?: string;
  linkTr?: string;
  linkEn?: string;
}

export interface InstructorComment {
  commentId: number;
  instructorId: number;
  userId: number;
  parentCommentId?: number | null;
  content: string;
  rating?: number;
  helpfulness?: number;
  clarity?: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  username?: string;
  isReported?: boolean;
  reportCount?: number;
  isAnonymous?: boolean;
  deleted?: boolean;
  user?: {
    name?: string;
    surname?: string;
    userId?: number;
  };
  term?: string;
  course?: string;
}

export interface InstructorCommentRating {
  ratingId: number;
  userId: number;
  commentId: number;
  isLike: boolean;
  createdAt: string;
}

export interface Program {
  programId: number;
  nameEn: string;
  nameTr: string;
  admissionTerm: number;
  universityCredits?: number;
  universityMinCourses?: number;
  requiredCredits?: number;
  requiredMinCourses?: number;
  coreCredits?: number;
  coreMinCourses?: number;
  coreElectiveCreditsI?: number;
  coreElectiveMinCoursesI?: number;
  coreElectiveCreditsII?: number;
  coreElectiveMinCoursesII?: number;
  areaCredits?: number;
  areaMinCourses?: number;
  freeElectiveCredits?: number;
  freeElectiveMinCourses?: number;
  facultyCredits?: number;
  facultyMinCourses?: number;
  mathRequiredCredits?: number;
  mathMinCourses?: number;
  philosophyRequiredCredits?: number;
  philosophyMinCourses?: number;
  engineeringEcts?: number;
  basicScienceEcts?: number;
  totalMinEcts?: number;
  totalMinCredits?: number;
}

export interface StudentPlan {
  planId: number;
  courseId: number;
  subject: string;
  courseCode: string;
  term: number;
}

export interface Note {
  noteId: number;
  userId: number;
  username: string;
  courseId: number;
  parentNoteId: number | null;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  anonymous: boolean;
  termTaken?: number | null;
  instructorTaken?: string | null;
  
  // Legacy fields for compatibility
  cloudLink?: string;
  user?: User;
  course?: Course;
}

export interface AuthResponse {
  message: string;
  requires2FA: boolean;
  role: string | null;
  user?: User | null;
  
  // Legacy fields for compatibility
  twoFactorRequired?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
} 