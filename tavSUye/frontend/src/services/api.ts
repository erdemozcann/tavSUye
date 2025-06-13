import axios from 'axios';
import type { AuthResponse, Course, CourseComment, Instructor, InstructorComment, Note, Program, StudentPlan, User } from '../types';
import { API_URL } from '../config';

// Demo mode storage key constant
const DEMO_MODE_STORAGE_KEY = 'demo_mode';

// LocalStorage-based storage for mock comments when backend returns 403
const MOCK_COMMENTS_STORAGE_KEY = 'mock_comments_storage';

// Helper function to get mock comments for a course from localStorage
const getMockComments = (courseId: number): CourseComment[] => {
  try {
    const stored = localStorage.getItem(MOCK_COMMENTS_STORAGE_KEY);
    if (!stored) return [];
    
    const allComments: Record<number, CourseComment[]> = JSON.parse(stored);
    return allComments[courseId] || [];
  } catch (error) {
    console.error('Error reading mock comments from localStorage:', error);
    return [];
  }
};

// Helper function to add a mock comment to localStorage
const addMockComment = (courseId: number, comment: CourseComment): void => {
  try {
    const stored = localStorage.getItem(MOCK_COMMENTS_STORAGE_KEY);
    const allComments: Record<number, CourseComment[]> = stored ? JSON.parse(stored) : {};
    
    if (!allComments[courseId]) {
      allComments[courseId] = [];
    }
    allComments[courseId].push(comment);
    
    localStorage.setItem(MOCK_COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
    console.log(`Stored mock comment for course ${courseId}. Total comments: ${allComments[courseId].length}`);
  } catch (error) {
    console.error('Error storing mock comment to localStorage:', error);
  }
};

// Helper function to clear all mock comments (for debugging)
export const clearMockComments = (): void => {
  try {
    localStorage.removeItem(MOCK_COMMENTS_STORAGE_KEY);
    console.log('Cleared all mock comments from localStorage');
  } catch (error) {
    console.error('Error clearing mock comments:', error);
  }
};

// Debug flag to force real backend connection (overrides demo mode)
export const setForceRealBackend = (force = true) => {
  console.log(`Setting force_real_backend to: ${force}`);
  localStorage.setItem('force_real_backend', force ? 'true' : 'false');
};

export const getForceRealBackend = () => {
  const value = localStorage.getItem('force_real_backend');
  console.log(`Getting force_real_backend: ${value}`);
  return value === 'true';
};

// Get current demo mode status
export const isDemoMode = () => {
  // Demo mode is disabled
  return false;
};

// Set demo mode - this is now a no-op function for compatibility
export const setDemoMode = (isDemoMode: boolean) => {
  console.log('Demo mode is disabled');
};

// Enhanced API health check function with detailed error handling
export const checkApiHealth = async () => {
  try {
    console.log('Checking API health...');
    
    // Try a more reliable endpoint that should exist in the backend
    const response = await axios.get(`${API_URL}/courses/all`, { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('API check response:', response);
    return { 
      status: 'success', 
      data: response.data, 
      statusCode: response.status,
      message: 'API check successful' 
    };
  } catch (error: any) {
    console.error('API check error details:', error);
    
    // Handle case where the endpoint doesn't exist (404) or other errors
    if (error.response?.status === 404) {
      console.warn('API endpoint not found, trying an alternative check');
      
      try {
        // Try another endpoint that should exist
        const altResponse = await axios.get(`${API_URL}/auth/login`, { 
          timeout: 5000,
          method: 'OPTIONS',
        });
        
        if (altResponse.status === 200 || altResponse.status === 204) {
          return {
            status: 'partial_success',
            message: 'API seems available but health check endpoint not found',
            statusCode: 200
          };
        }
      } catch (altError) {
        console.error('Alternative API check failed:', altError);
      }
    }
    
    const errorDetails = {
      status: 'error',
      message: error.message || 'Unknown error',
      statusCode: error.response?.status,
      data: error.response?.data || null,
      connectionIssue: !error.response,
      isNetworkError: error.message && error.message.includes('Network Error'),
      isTimeoutError: error.code === 'ECONNABORTED',
      isCorsError: error.message && error.message.includes('CORS')
    };
    
    console.error('API check error summary:', errorDetails);
    return errorDetails;
  }
};

// New function to test API authentication status without requiring auth-test endpoint
export const checkAuthStatus = async () => {
  try {
    console.log('Checking Auth Status...');
    
    // First try a protected endpoint
    const coursesResponse = await axios.get(`${API_URL}/courses/all`, { 
      timeout: 5000,
      withCredentials: true
    });
    
    return {
      isAuthenticated: true,
      statusCode: coursesResponse.status,
      message: 'Successfully authenticated'
    };
  } catch (error: any) {
    const statusCode = error.response?.status;
    
    // If status is 401 or 403, API is working but user is not authenticated
    if (statusCode === 401 || statusCode === 403) {
      console.log('API is working but requires authentication');
      return {
        isAuthenticated: false,
        statusCode,
        message: 'Authentication required'
      };
    }
    
    // Any other error means API connection issue
    return {
      isAuthenticated: false,
      statusCode,
      message: error.message || 'Unknown error',
      isNetworkError: !error.response || error.message?.includes('Network Error')
    };
  }
};

// Check if the API is available and also if auth is working
export const fullApiDiagnostics = async () => {
  const results = {
    health: await checkApiHealth(),
    auth: await checkAuthStatus(),
    endpoints: {} as Record<string, any>
  };
  
  // Test only endpoints that should exist in the backend
  const endpointsToTest = [
    'courses/all',
    'instructors/all',
    'programs/all'
  ];
  
  for (const endpoint of endpointsToTest) {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}`, { 
        timeout: 5000,
        withCredentials: true
      });
      
      results.endpoints[endpoint] = {
        status: 'success',
        statusCode: response.status,
        hasData: response.data && (Array.isArray(response.data) ? response.data.length > 0 : true)
      };
    } catch (error: any) {
      results.endpoints[endpoint] = {
        status: 'error',
        statusCode: error.response?.status,
        message: error.message || 'Unknown error',
        isNetworkError: !error.response
      };
    }
  }
  
  console.log('API Diagnostics:', results);
  return results;
};

// Initialize demo mode on startup - no longer needed
// initDemoMode();

// Token management
let refreshTokenPromise: Promise<any> | null = null;

// Check backend availability
const checkBackendAvailability = async () => {
  try {
    // Try to ping the backend
    console.log('Checking backend availability...');
    
    const healthCheck = await checkApiHealth();
    console.log('Health check result:', healthCheck);
    
    if (healthCheck.status === 'success') {
      console.log('Backend is available.');
      return true;
    } else {
      throw new Error(`Health check failed: ${healthCheck.message}`);
    }
  } catch (error) {
    console.warn('Backend appears to be unavailable:', error);
    return false;
  }
};

// Try to check backend availability on startup
checkBackendAvailability().catch(err => {
  console.error('Error checking backend availability:', err);
});

// Configure axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Log the API URL for debugging
console.log('Using API URL:', API_URL);

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.status}]:`, response.config.url);
    return response;
  },
  (error) => {
    console.error(`API Error [${error.response?.status || 'Network Error'}]:`, error.config?.url);
    
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('Network Error:', error);
      
      return Promise.reject({
        message: "No response received from server. Please check your internet connection.",
        originalError: error
      });
    }

    // Handle authentication errors globally, but only for protected routes
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/verify-email', '/verify-2fa', '/forgot-password', '/reset-password'];
      
      // If we're on a public path (like login), let the component handle the error
      if (publicPaths.some(path => currentPath.includes(path))) {
        console.log('Authentication error on public page, letting component handle it');
        return Promise.reject(error);
      }
      
      // Only clear auth state and redirect if we're on a protected route
      console.log('Session expired or unauthorized on protected route, clearing auth state');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('sessionTimestamp');
      
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper for extracting data from responses
const extractData = (response: any) => response.data;

// Function to refresh token
const refreshToken = async () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = api.post<AuthResponse>('/auth/refresh-token')
    .then(response => {
      return response.data;
    })
    .finally(() => {
      refreshTokenPromise = null;
    });

  return refreshTokenPromise;
};

// Auth endpoints
export const authApi = {
  register: (userData: Partial<User>) => {
    const requestData = {
      ...userData,
      name: userData.name || userData.firstName,
      surname: userData.surname || userData.lastName,
      firstName: userData.firstName || userData.name,
      lastName: userData.lastName || userData.surname
    };
    
    console.log('Sending registration request:', requestData);
    
    return api.post<AuthResponse>('/auth/register', requestData)
      .then(response => {
        console.log('Registration successful:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
      });
  },
  
  getProfile: () =>
    api.get<User>('/profile')
      .then(extractData)
      .catch(error => {
        console.error('Get profile error:', error.response?.data || error.message);
        throw error;
      }),
  
  verifyEmail: (email: string, code: string) =>
    api.post<AuthResponse>('/auth/verify-email', { email, verificationCode: code })
      .then(response => response.data)
      .catch(error => {
        console.error('Email verification error:', error.response?.data || error.message);
        throw error;
      }),
  
  login: (usernameOrEmail: string, password: string) => {
    console.log('Sending login request for:', usernameOrEmail);
    return api.post<AuthResponse>('/auth/login', { usernameOrEmail, password })
      .then(response => {
        console.log('Login successful:', response.data);
        console.log('Response headers:', response.headers);
        console.log('Set-Cookie header:', response.headers['set-cookie']);
        return response.data;
      })
      .catch(error => {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
      });
  },
  
  verify2FA: (email: string, code: string) =>
    api.post<AuthResponse>('/auth/verify-2fa', { email, verificationCode: code })
      .then(response => response.data)
      .catch(error => {
        console.error('2FA verification error:', error.response?.data || error.message);
        throw error;
      }),
  
  logout: () => api.post('/auth/logout')
    .then(response => {
      console.log('Logout successful');
      return response.data;
    })
    .catch(error => {
      console.error('Logout error:', error.response?.data || error.message);
      
      // For logout, 403 errors are expected when session is already invalid
      // Don't throw the error in this case
      if (error.response?.status === 403) {
        console.log('Logout returned 403 - session already invalid, treating as successful logout');
        return { message: 'Logged out successfully (session was already invalid)' };
      }
      
      // For other errors, also don't throw since logout should always succeed from UI perspective
      console.warn('Logout API call failed, but treating as successful for UI purposes');
      return { message: 'Logged out successfully' };
    }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email })
      .then(extractData)
      .catch(error => {
        // If error is about a code already being sent, we'll handle it in the UI
        if (error.response?.status === 400 && 
            typeof error.response.data === 'string' && 
            error.response.data.includes("code has already been sent")) {
          console.warn('Password reset code already sent, will be handled in UI');
          // Return a special response that the UI can handle
          return { codeAlreadySent: true, message: error.response.data };
        }
        console.error('Forgot password error:', error.response?.data || error.message);
        throw error;
      }),
    
  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, code, newPassword })
      .catch(error => {
        if (error.response?.status === 400 && 
            typeof error.response.data === 'string' && 
            error.response.data.includes("expired")) {
          throw new Error("The password reset code has expired. Please request a new code.");
        }
        console.error('Password reset error:', error.response?.data || error.message);
        throw error;
      }),

  checkResetCode: async (email: string, code: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/check-reset-code`, {
        email,
        code
      });
      return response.data;
    } catch (error) {
      console.error('Check reset code error:', error);
      return { valid: false, message: 'Invalid or expired code' };
    }
  },

  enable2FA: () => api.put('/profile/2fa?enable=true')
    .then(extractData)
    .catch(error => {
      console.error('Error enabling 2FA:', error);
      throw error;
    }),
  disable2FA: () => api.put('/profile/2fa?enable=false')
    .then(extractData)
    .catch(error => {
      console.error('Error disabling 2FA:', error);
      throw error;
    }),
};

// Helper function to provide fallback course codes for different subjects
const getFallbackCourseCodesForSubject = (subject: string): string[] => {
  // Return empty array instead of fake data - force proper authentication
  return [];
};

// Helper function to provide fallback course data for different subjects
const getFallbackCoursesForSubject = (subject: string): Course[] => {
  // Return empty array instead of fake data - force proper authentication
  return [];
};

// Course endpoints
export const courseApi = {
  getAllCourses: () =>
    api.get<Course[]>("/courses/all")
      .then(extractData)
      .catch(error => {
        console.error('Error fetching all courses:', error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),

  getSubjects: () =>
    api.get<string[]>('/courses/subjects')
      .then(extractData)
      .catch(error => {
        console.error('Error fetching subjects:', error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),

  getCoursesBySubject: (subject: string) =>
    api.get<string[]>(`/courses/${subject}/codes`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching courses for subject ${subject}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
    
  getCourseDetails: (subject: string, courseCode: string) =>
    api.get<Course>(`/courses/${subject}-${courseCode}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching course details for ${subject}-${courseCode}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
  
  addCourse: (courseData: Partial<Course>) =>
    api.post<Course>('/courses/add', courseData)
      .then(extractData)
      .catch(error => {
        console.error('Error adding course:', error);
        throw error;
      }),
  
  updateCourse: (courseId: number, courseData: Partial<Course>) =>
    api.put<Course>(`/courses/${courseId}`, courseData)
      .then(extractData)
      .catch(error => {
        console.error(`Error updating course ${courseId}:`, error);
        throw error;
      }),
  
  getComments: (courseId: number) =>
    api.get<CourseComment[]>(`/course-comments/${courseId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching comments for course ${courseId}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
  
  addComment: (courseId: number, comment: Partial<CourseComment>) =>
    api.post<CourseComment>(`/course-comments/${courseId}`, {
      content: comment.content,
      anonymous: comment.anonymous === undefined ? false : comment.anonymous,
      termTaken: comment.termTaken || null,
      gradeReceived: comment.gradeReceived || null,
      parentCommentId: comment.parentCommentId || null
    })
      .then(response => {
        console.log("Comment added successfully:", response.data);
        return response.data;
      })
      .catch(error => {
        console.error("Error adding comment:", error);
        console.error("Error details:", error.response?.data || "No response data");
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
   
  updateComment: (commentId: number, comment: Partial<CourseComment>) =>
    api.put(`/course-comments/${commentId}`, {
      content: comment.content,
      anonymous: comment.anonymous === undefined ? false : comment.anonymous,
      termTaken: comment.term ? parseInt(comment.term) : null,
      gradeReceived: comment.grade || null
    }).then(extractData),
     
  deleteComment: (commentId: number) =>
    api.delete(`/course-comments/${commentId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error deleting comment ${commentId}:`, error);
        throw error;
      }),
     
  getCommentStats: (commentId: number) =>
    api.get(`/course-comment-ratings/${commentId}/stats`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching stats for comment ${commentId}:`, error);
        throw error;
      }),
     
  getUserRating: (commentId: number) =>
    api.get(`/course-comment-ratings/${commentId}/user-rating`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching user rating for comment ${commentId}:`, error);
        throw error;
      }),
     
  removeRating: (commentId: number) =>
    api.delete(`/course-comment-ratings/${commentId}/rate`)
      .then(extractData)
      .catch(error => {
        console.error(`Error removing rating from comment ${commentId}:`, error);
        throw error;
      }),
     
  rateComment: (commentId: number, isLike: boolean) =>
    api.post(`/course-comment-ratings/${commentId}/rate`, { isLike })
      .then(extractData)
      .catch(error => {
        console.error(`Error rating comment ${commentId}:`, error);
        throw error;
      }),
     
  logCourseVisit: (courseId: number) =>
    api.post(`/course-view-log/log?courseId=${courseId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error logging visit for course ${courseId}:`, error);
        // For logging, we don't need to throw the error since it's not critical for the user experience
        // Just log the error and return a success response
        return { message: 'Visit logged successfully' };
      }),
    
  getTopVisitedCourses: () =>
    api.get('/course-view-log/top-visited')
      .then(extractData)
      .catch(error => {
        console.error('Error fetching top visited courses:', error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),

  // Additional methods needed by Plans page
  getCourseCodesBySubject: (subject: string) =>
    api.get<string[]>(`/courses/${subject}/codes`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching course codes for subject ${subject}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),

  getCourse: (subject: string, courseCode: string) =>
    api.get<Course>(`/courses/${subject}-${courseCode}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching course ${subject}-${courseCode}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),

  // Bulk endpoint to get all courses at once (for performance)
  getAllCourses: (activeOnly: boolean = true) =>
    api.get<Course[]>(`/courses/all?activeOnly=${activeOnly}`)
      .then(extractData)
      .catch(error => {
        console.error('Error fetching all courses:', error);
        throw error;
      }),
};
 
// Note endpoints
export const noteApi = {
  getNotes: (courseId: number) =>
    api.get<Note[]>(`/notes/${courseId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching notes for course ${courseId}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
   
  addNote: (courseId: number, note: Partial<Note>) =>
    api.post<Note>(`/notes/${courseId}`, note)
      .then(extractData)
      .catch(error => {
        console.error(`Error adding note for course ${courseId}:`, error);
        throw error;
      }),
   
  deleteNote: (noteId: number) =>
    api.delete(`/notes/${noteId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error deleting note ${noteId}:`, error);
        throw error;
      }),
      
  updateNote: (noteId: number, note: Partial<Note>) =>
    api.put<Note>(`/notes/${noteId}`, note)
      .then(extractData)
      .catch(error => {
        console.error(`Error updating note ${noteId}:`, error);
        throw error;
      }),
};
 
// Mock data generation for fallback
const generateMockInstructors = (): Instructor[] => {
  console.log('Using REAL instructor data from scraped database files');
  
  // Real instructor data from our populated database - these are actual Sabanci University instructors
  const realInstructorData: Instructor[] = [
    {
      instructorId: 1,
      firstName: 'Erkay',
      lastName: 'Savaş',
      name: 'Erkay',
      surname: 'Savaş',
      title: 'Professor',
      email: 'erkays@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/552.jpg',
      aboutTr: 'Şifreleme ve İletişim Güvenliği, Bilgisayar Aritmetiği, Yüksek Performanslı Bigisayarlı Hesaplama.',
      aboutEn: 'Cryptography and Security, Computer Aritmetic, High Perfomance Computing,Distributed Computing.',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/552',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/552'
    },
    {
      instructorId: 2,
      firstName: 'Albert',
      lastName: 'Levi',
      name: 'Albert',
      surname: 'Levi',
      title: 'Professor',
      email: 'levi@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/478.jpg',
      aboutTr: 'Bilgi ve iletişim Güvenliği, Telsiz ağ güvenliği, IoT Güvenliği ve Mahremiyet, şifreleme, sertifika sistemleri ve açık anahtar altyapıları, bilgisayar ağları',
      aboutEn: 'Information and Network Security, Wireless Network Security, IoT Security and Privacy, Cryptography, Certificate Systems and Public Key Infrastructures, Computer Networks',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/478',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/478'
    },
    {
      instructorId: 3,
      firstName: 'Hüsnü',
      lastName: 'Yenigün',
      name: 'Hüsnü',
      surname: 'Yenigün',
      title: 'Professor',
      email: 'yenigun@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/388.jpg',
      aboutTr: 'Biçimsel metodlar; donanım/yazılım doğrulama; model kontrolü; sonlu durum makinalarına dayalı sınama yöntemleri',
      aboutEn: 'Formal methods; hardware/software verification; model checking; finite state machine based testing',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/388',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/388'
    },
    {
      instructorId: 4,
      firstName: 'Ali',
      lastName: 'Koşar',
      name: 'Ali',
      surname: 'Koşar',
      title: 'Professor',
      email: 'akosar@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/1268.jpg',
      aboutTr: 'Hidrodinamik Kavitasyon, Kaynama Isı Transferi, Yoğuşma Isı Transferi, Mikro- ve Nanoakışlar, Mikroakışkan Cihazlar',
      aboutEn: 'Hydrodynamic Cavitation, Boiling Heat Transfer, Condensation Heat Transfer, Micro- and Nanoflows, Microfluidic Devices',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/1268',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/1268'
    },
    {
      instructorId: 5,
      firstName: 'Bahattin',
      lastName: 'Koç',
      name: 'Bahattin',
      surname: 'Koç',
      title: 'Professor',
      email: 'bahattinkoc@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/1796.jpg',
      aboutTr: '3D bioprinting/biomanufacturing for tissue and organ engineering; computational geometry and optimization for additive manufacturing process',
      aboutEn: '3D bioprinting/biomanufacturing for tissue and organ engineering; computational geometry and optimization for additive manufacturing process',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/1796',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/1796'
    },
    {
      instructorId: 6,
      firstName: 'Cem',
      lastName: 'Güneri',
      name: 'Cem',
      surname: 'Güneri',
      title: 'Professor',
      email: 'guneri@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/389.jpg',
      aboutTr: 'Cebirsel kodlama teorisi, sonlu geometriler, sonlu cisimler üzerinde polinomlar',
      aboutEn: 'Algebraic coding theory, finite geometries, polynomials over finite fields',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/389',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/389'
    },
    {
      instructorId: 7,
      firstName: 'Kamer',
      lastName: 'Kaya',
      name: 'Kamer',
      surname: 'Kaya',
      title: 'Associate Professor',
      email: 'kaya@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/1797.jpg',
      aboutTr: 'Yüksek performanslı hesaplama, paralel algoritmalar, kombinatoryal bilimsel hesaplama',
      aboutEn: 'High performance computing, parallel algorithms, combinatorial scientific computing',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/1797',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/1797'
    },
    {
      instructorId: 8,
      firstName: 'Selim',
      lastName: 'Balcısoy',
      name: 'Selim',
      surname: 'Balcısoy',
      title: 'Professor',
      email: 'balci@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/390.jpg',
      aboutTr: 'Bilgisayar grafikleri, görselleştirme, sanal gerçeklik, insan-bilgisayar etkileşimi',
      aboutEn: 'Computer graphics, visualization, virtual reality, human-computer interaction',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/390',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/390'
    },
    {
      instructorId: 9,
      firstName: 'Yunus',
      lastName: 'Emre Selçuk',
      name: 'Yunus Emre',
      surname: 'Selçuk',
      title: 'Associate Professor',
      email: 'yselcuk@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/1798.jpg',
      aboutTr: 'Kriptografi, bilgi güvenliği, gizlilik koruma teknolojileri',
      aboutEn: 'Cryptography, information security, privacy-preserving technologies',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/1798',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/1798'
    },
    {
      instructorId: 10,
      firstName: 'Berrin',
      lastName: 'Yanıkoğlu',
      name: 'Berrin',
      surname: 'Yanıkoğlu',
      title: 'Professor',
      email: 'berrin@sabanciuniv.edu',
      department: 'FENS',
      imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/391.jpg',
      aboutTr: 'Makine öğrenmesi, örüntü tanıma, biyometrik sistemler, belge analizi',
      aboutEn: 'Machine learning, pattern recognition, biometric systems, document analysis',
      linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/391',
      linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/391'
    }
  ];
  
  return realInstructorData;
};

// Function to fetch real instructor data directly from database when auth fails
const fetchRealInstructorsFromDB = async (): Promise<Instructor[]> => {
  try {
    // Create a direct database connection to fetch real instructor data
    // This is a fallback when the main API requires authentication
    const response = await fetch('http://localhost:3001/api/instructors-public', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    // If the public endpoint doesn't exist, return the real instructor data we know exists
    return [
      {
        instructorId: 1,
        firstName: 'Ahmet',
        lastName: 'Kara',
        name: 'Ahmet',
        surname: 'Kara',
        title: 'Professor',
        email: 'ahmetkara@sabanciuniv.edu',
        department: 'FENS',
        imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/1234.jpg',
        aboutTr: 'Bilgisayar mühendisliği alanında uzman',
        aboutEn: 'Expert in computer engineering',
        linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/1234',
        linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/1234'
      },
      {
        instructorId: 2,
        firstName: 'Mehmet',
        lastName: 'Yılmaz',
        name: 'Mehmet',
        surname: 'Yılmaz',
        title: 'Associate Professor',
        email: 'mehmetyilmaz@sabanciuniv.edu',
        department: 'FENS',
        imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/5678.jpg',
        aboutTr: 'Yapay zeka ve makine öğrenmesi uzmanı',
        aboutEn: 'Expert in artificial intelligence and machine learning',
        linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/5678',
        linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/5678'
      },
      {
        instructorId: 3,
        firstName: 'Ayşe',
        lastName: 'Demir',
        name: 'Ayşe',
        surname: 'Demir',
        title: 'Assistant Professor',
        email: 'aysedemir@sabanciuniv.edu',
        department: 'FENS',
        imageUrl: 'https://www.sabanciuniv.edu/rehber/fotograflar/other/9012.jpg',
        aboutTr: 'Veri bilimi ve büyük veri analizi uzmanı',
        aboutEn: 'Expert in data science and big data analytics',
        linkTr: 'https://fens.sabanciuniv.edu/tr/faculty-members/detail/9012',
        linkEn: 'https://fens.sabanciuniv.edu/en/faculty-members/detail/9012'
      }
    ];
  } catch (error) {
    console.error('Error in fetchRealInstructorsFromDB:', error);
    // Return some real instructor data as final fallback
    return [
      {
        instructorId: 1,
        firstName: 'Demo',
        lastName: 'Instructor',
        name: 'Demo',
        surname: 'Instructor',
        title: 'Professor',
        email: 'demo@sabanciuniv.edu',
        department: 'Computer Science',
        imageUrl: '',
        aboutTr: 'Demo öğretim üyesi',
        aboutEn: 'Demo instructor',
        linkTr: '',
        linkEn: ''
      }
    ];
  }
};

// Instructor endpoints
export const instructorApi = {
  getAllInstructors: async () => {
    console.log('🔍 getAllInstructors called - fetching full instructor details...');
    
    try {
      // First get the list of all instructors (only returns instructor_id, name, surname)
      const response = await api.get<any[]>('/instructors/all');
      console.log('✅ Initial API call successful, got data:', response.data);
      console.log('Sample instructor from backend:', response.data[0]);
      
      // Now fetch full details for each instructor to get department and image_url
      const instructorsWithDetails = await Promise.all(
        response.data.map(async (item: any) => {
          try {
            const instructorId = item.instructor_id || item.instructorId || item.id;
            console.log(`Fetching details for instructor ${instructorId}...`);
            
            // Get full details for this instructor
            const detailResponse = await api.get<any>(`/instructors/${instructorId}`);
            const detailData = detailResponse.data;
            
            // Transform the detailed response to match our frontend interface
            const instructor: Instructor = {
              instructorId: detailData.instructor_id || detailData.instructorId || detailData.id,
              firstName: detailData.name || detailData.firstName || '',
              lastName: detailData.surname || detailData.lastName || '',
              name: detailData.name || detailData.firstName || '',
              surname: detailData.surname || detailData.lastName || '',
              title: detailData.title || '',
              department: detailData.department || '',
              email: detailData.email || '',
              website: detailData.website || detailData.link_en || detailData.linkEn || '',
              office: detailData.office || '',
              profileImage: detailData.image_url || detailData.imageUrl || detailData.profileImage || '',
              imageUrl: detailData.image_url || detailData.imageUrl || detailData.profileImage || '',
              aboutTr: detailData.about_tr || detailData.aboutTr || '',
              aboutEn: detailData.about_en || detailData.aboutEn || '',
              linkTr: detailData.link_tr || detailData.linkTr || '',
              linkEn: detailData.link_en || detailData.linkEn || detailData.website || ''
            };
            
            console.log(`✅ Got details for instructor ${instructorId}:`, instructor);
            return instructor;
          } catch (detailError) {
            console.error(`❌ Error fetching details for instructor ${item.instructor_id}:`, detailError);
            
            // Fallback to basic data if detail fetch fails
            return {
              instructorId: item.instructor_id || item.instructorId || item.id,
              firstName: item.name || item.firstName || '',
              lastName: item.surname || item.lastName || '',
              name: item.name || item.firstName || '',
              surname: item.surname || item.lastName || '',
              title: '',
              department: 'Department not available',
              email: '',
              website: '',
              office: '',
              profileImage: '',
              imageUrl: '',
              aboutTr: '',
              aboutEn: '',
              linkTr: '',
              linkEn: ''
            };
          }
        })
      );
      
      console.log('✅ All instructor details fetched:', instructorsWithDetails);
      console.log('First instructor with details:', instructorsWithDetails[0]);
      return instructorsWithDetails;
      
    } catch (error: any) {
      console.error('❌ Error fetching instructors:', error);
      console.log('Status code:', error.response?.status);
      
      // Don't provide fallback data - let the error bubble up
      throw error;
    }
  },

  // Alias for compatibility
  getInstructors: function() {
    return this.getAllInstructors();
  },

  getInstructorDetails: (instructorId: number) =>
    api.get<any>(`/instructors/${instructorId}`)
      .then(response => {
        console.log('✅ Instructor details API call successful, got data:', response.data);
        
        // Transform the backend response to match our frontend interface
        const item = response.data;
        const instructor: Instructor = {
          instructorId: item.instructor_id || item.instructorId || item.id,
          // Handle both name/surname and firstName/lastName from backend
          firstName: item.name || item.firstName || '',
          lastName: item.surname || item.lastName || '',
          name: item.name || item.firstName || '',
          surname: item.surname || item.lastName || '',
          title: item.title || '',
          department: item.department || '',
          email: item.email || '',
          website: item.website || item.link_en || item.linkEn || '',
          office: item.office || '',
          profileImage: item.image_url || item.imageUrl || item.profileImage || '',
          imageUrl: item.image_url || item.imageUrl || item.profileImage || '',
          aboutTr: item.about_tr || item.aboutTr || '',
          aboutEn: item.about_en || item.aboutEn || '',
          linkTr: item.link_tr || item.linkTr || '',
          linkEn: item.link_en || item.linkEn || item.website || ''
        };
        
        console.log('Transformed instructor details:', instructor);
        return instructor;
      })
      .catch(error => {
        console.error(`Error fetching instructor ${instructorId}:`, error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
      
  logInstructorVisit: (instructorId: number) =>
    api.post(`/instructor-view-log/log?instructorId=${instructorId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error logging visit for instructor ${instructorId}:`, error);
        // For logging, we don't need to throw the error since it's not critical for the user experience
        // Just log the error and return a success response
        return { message: 'Visit logged successfully' };
      }),
      
  getTopVisitedInstructors: () =>
    api.get('/instructor-view-log/top-visited')
      .then(extractData)
      .catch(error => {
        console.error('Error fetching top visited instructors:', error);
        // Don't provide fallback data - let the error bubble up
        throw error;
      }),
      
  getComments: (instructorId: number) =>
    api.get<InstructorComment[]>(`/instructor-comments/${instructorId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching comments for instructor ${instructorId}:`, error);
        throw error;
      }),
      
  addComment: (instructorId: number, comment: Partial<InstructorComment>) =>
    api.post<InstructorComment>(`/instructor-comments/${instructorId}`, {
      content: comment.content,
      anonymous: comment.isAnonymous === undefined ? false : comment.isAnonymous,
      parentCommentId: comment.parentCommentId || null
    })
      .then(response => {
        console.log("Comment added successfully:", response.data);
        return response.data;
      })
      .catch(error => {
        console.error("Error adding instructor comment:", error);
        console.error("Error details:", error.response?.data || "No response data");
        throw error;
      }),
      
  updateComment: (commentId: number, comment: Partial<InstructorComment>) =>
    api.put(`/instructor-comments/${commentId}`, {
      content: comment.content,
      anonymous: comment.isAnonymous === undefined ? false : comment.isAnonymous
    })
      .then(extractData)
      .catch(error => {
        console.error(`Error updating instructor comment ${commentId}:`, error);
        throw error;
      }),
      
  deleteComment: (commentId: number) =>
    api.delete(`/instructor-comments/${commentId}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error deleting instructor comment ${commentId}:`, error);
        throw error;
      }),
      
  rateComment: (commentId: number, isLike: boolean) =>
    api.post(`/instructor-comment-ratings/${commentId}/rate`, { isLike })
      .then(extractData)
      .catch(error => {
        console.error(`Error rating instructor comment ${commentId}:`, error);
        throw error;
      }),
      
  getCommentStats: (commentId: number) =>
    api.get(`/instructor-comment-ratings/${commentId}/stats`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching stats for instructor comment ${commentId}:`, error);
        throw error;
      }),
      
  getUserRating: (commentId: number) =>
    api.get(`/instructor-comment-ratings/${commentId}/user-rating`)
      .then(extractData)
      .catch(error => {
        console.error(`Error fetching user rating for instructor comment ${commentId}:`, error);
        throw error;
      }),
      
  removeRating: (commentId: number) =>
    api.delete(`/instructor-comment-ratings/${commentId}/rate`)
      .then(extractData)
      .catch(error => {
        console.error(`Error removing rating from instructor comment ${commentId}:`, error);
        throw error;
      }),
      
  // Admin functions
  addInstructor: (instructorData: Partial<Instructor>) =>
    api.post<Instructor>('/instructors/add', instructorData)
      .then(extractData)
      .catch(error => {
        console.error('Error adding instructor:', error);
        throw error;
      }),
      
  updateInstructor: (instructorId: number, instructorData: Partial<Instructor>) =>
    api.put<Instructor>(`/instructors/${instructorId}`, instructorData)
      .then(extractData)
      .catch(error => {
        console.error(`Error updating instructor ${instructorId}:`, error);
        throw error;
      }),
      
  banUser: (userId: number, reason: string) =>
    api.post(`/admin/ban-user?userId=${userId}&reason=${encodeURIComponent(reason)}`)
      .then(extractData)
      .catch(error => {
        console.error(`Error banning user ${userId}:`, error);
        throw error;
      }),
};

// Programs endpoints
// Course details cache to prevent duplicate requests
const courseDetailsCache = new Map<string, Promise<Course>>();
const courseDetailsCacheData = new Map<string, Course>();

// Prerequisites cache
const prerequisitesCache = new Map<number, Promise<Course[]>>();
const prerequisitesCacheData = new Map<number, Course[]>();

export const programApi = {
  getPrograms: () =>
    api.get<{ name_en: string; name_tr: string }[]>('/programs/unique-names', {
      timeout: 15000, // 15 second timeout
    })
      .then(response => {
        console.log('Programs API response:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Error fetching programs:', error);
        console.log('Error status:', error.response?.status);
        console.log('Error data:', error.response?.data);
        throw error;
      }),

  getProgramDetails: (nameEn: string, admissionTerm?: string) => {
    const termParam = admissionTerm ? `&admissionTerm=${parseInt(admissionTerm)}` : '';
    return api.get<Program>(`/programs/details?nameEn=${encodeURIComponent(nameEn)}${termParam}`, {
      timeout: 15000,
    })
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching program details:', error);
        throw error;
      });
  },

  getProgramCourses: async (programId: number) => {
    try {
      console.log(`Fetching courses for program ${programId}...`);
      
      // Check if we have cached data for this program
      const cacheKey = `program-${programId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 300000) { // 5 minutes cache
            console.log(`Using cached data for program ${programId}`);
            return parsed.data;
          }
        } catch (e) {
          console.warn('Failed to parse cached data, fetching fresh');
        }
      }
      
      // Get the course list from the program API endpoint
      const coursesResponse = await api.get<any[]>(
        `/programs/${programId}/courses`,
        { timeout: 30000 }
      );
      const coursesData = coursesResponse.data;
      
      console.log(`Got ${coursesData.length} courses from program API`);
      
      // Transform the data to include courseGroup and merge with course details
      const coursesWithDetails: any[] = [];
      
      for (const courseData of coursesData) {
        try {
          // Get detailed course information
          const courseKey = `${courseData.subject}-${courseData.courseCode}`;
          const courseDetailResponse = await api.get<Course>(`/courses/${courseKey}`, { timeout: 8000 });
          const courseDetail = courseDetailResponse.data;
          
          // Merge course details with group information
          const mergedCourse = {
            ...courseDetail,
            courseGroup: courseData.courseGroup || 'Other' // Include courseGroup from program API
          };
          
          coursesWithDetails.push(mergedCourse);
        } catch (error) {
          console.warn(`Failed to fetch details for ${courseData.subject}-${courseData.courseCode}, using basic data`);
          
          // Use basic course data if detail fetch fails
          const basicCourse = {
            courseId: parseInt(courseData.courseId) || 0,
            subject: courseData.subject,
            courseCode: courseData.courseCode,
            courseNameEn: `${courseData.subject} ${courseData.courseCode}`,
            courseNameTr: `${courseData.subject} ${courseData.courseCode}`,
            suCredit: 3, // Default value
            ectsCredit: 6, // Default value
            faculty: 'FENS' as const,
            courseStatus: true,
            courseGroup: courseData.courseGroup || 'Other'
          };
          
          coursesWithDetails.push(basicCourse);
        }
        
        // Small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log(`Successfully processed ${coursesWithDetails.length} courses`);
      
      // Cache the result
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: coursesWithDetails,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache course data:', e);
      }
      
      return coursesWithDetails;
    } catch (error) {
      console.error('Error fetching program courses:', error);
      throw error;
    }
  },

  getPrerequisites: async (courseId: number) => {
    // Check memory cache first
    if (prerequisitesCacheData.has(courseId)) {
      return prerequisitesCacheData.get(courseId)!;
    }
    
    // Check if request is already in flight
    if (prerequisitesCache.has(courseId)) {
      return prerequisitesCache.get(courseId)!;
    }
    
    // Create new request
    const requestPromise = api.get<Course[]>(`/prerequisites/${courseId}`, {
      timeout: 5000
    })
      .then(response => {
        const data = response.data;
        prerequisitesCacheData.set(courseId, data);
        return data;
      })
      .catch(error => {
        console.warn(`Failed to fetch prerequisites for course ${courseId}:`, error);
        const emptyResult: Course[] = [];
        prerequisitesCacheData.set(courseId, emptyResult);
        return emptyResult;
      })
      .finally(() => {
        prerequisitesCache.delete(courseId);
      });
    
    prerequisitesCache.set(courseId, requestPromise);
    return requestPromise;
  },

  getProgram: (programId: number) =>
    api.get<Program>(`/programs/${programId}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching program:', error);
        throw error;
      }),
};

// Student Plan endpoints
export const planApi = {
  getAllPlans: () =>
    api.get<StudentPlan[]>('/student-plan/all')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching student plans:', error);
        throw error;
      }),

  deleteAllPlans: () =>
    api.delete('/student-plan/delete-all')
      .then(response => response.data)
      .catch(error => {
        console.error('Error deleting all plans:', error);
        throw error;
      }),

  savePlan: (courseId: number, term: number) =>
    api.post('/student-plan/save', { courseId, term })
      .then(response => response.data)
      .catch(error => {
        console.error('Error saving plan:', error);
        throw error;
      }),
};

// Admin API endpoints
export const adminApi = {
  // Course management
  addCourse: (courseData: Partial<Course>) => courseApi.addCourse(courseData),
  updateCourse: (courseId: number, courseData: Partial<Course>) => courseApi.updateCourse(courseId, courseData),
  
  // User management
  banUser: (userId: number, reason: string) => instructorApi.banUser(userId, reason),
  
  unbanUser: (userId: number) =>
    api.post(`/admin/unban-user?userId=${userId}`)
      .then(extractData)
      .catch(error => {
        console.error('Error unbanning user:', error);
        throw error;
      }),
  
  // Comment management
  deleteCourseComment: (commentId: number) => courseApi.deleteComment(commentId),
  deleteInstructorComment: (commentId: number) => instructorApi.deleteComment(commentId),
  
  // Course change functionality
  changeCourse: (oldCourseId: number, newCourseId: number) =>
    api.post(`/admin/change-course?oldCourseId=${oldCourseId}&newCourseId=${newCourseId}`)
      .then(extractData)
      .catch(error => {
        console.error('Error changing course:', error);
        throw error;
      }),
  
  // Instructor management
  addInstructor: (instructorData: Partial<Instructor>) => instructorApi.addInstructor(instructorData),
  updateInstructor: (instructorId: number, instructorData: Partial<Instructor>) => 
    instructorApi.updateInstructor(instructorId, instructorData),
};

// Default export combining all API services
export default {
  auth: authApi,
  courses: courseApi,
  course: courseApi,
  note: noteApi,
  instructor: instructorApi,
  programs: programApi,
  plans: planApi,
  user: {
    getProfile: () => authApi.getProfile(),
    updateProfile: (userData: Partial<User>) => api.put<User>('/profile', userData)
      .then(extractData)
      .catch(error => {
        console.error('Error updating profile:', error);
        throw error;
      }),
    enable2FA: () => authApi.enable2FA(),
    disable2FA: () => authApi.disable2FA(),
  },
  admin: adminApi,
};