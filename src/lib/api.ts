const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Token management
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
};

// Base fetch wrapper with JWT auth
interface FetchOptions extends RequestInit {
  noAuth?: boolean;
}

export const fetchAPI = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { noAuth = false, headers = {}, ...rest } = options;

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (!noAuth) {
    const token = getToken();
    if (token) {
      fetchHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: fetchHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.message || `API Error: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

// Types
export interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "leader" | "organizer";
  emailVerified: boolean;
  profile: {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Prayer {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Testimony {
  id: string;
  userId: string;
  title: string;
  content: string;
  videoUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  capacity?: number;
  registered?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  groupId?: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// AUTH ENDPOINTS
export const auth = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => fetchAPI<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data), noAuth: true }),

  login: (email: string, password: string) =>
    fetchAPI<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      noAuth: true,
    }),

  verifyEmail: (token: string) =>
    fetchAPI<{ success: boolean }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      noAuth: true,
    }),

  forgotPassword: (email: string) =>
    fetchAPI<{ success: boolean }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      noAuth: true,
    }),

  resetPassword: (token: string, password: string) =>
    fetchAPI<{ success: boolean }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      noAuth: true,
    }),

  getMe: () => fetchAPI<User>("/auth/me"),
};

// PROFILE ENDPOINTS
export const profile = {
  getProfile: (userId: string) =>
    fetchAPI<User>(`/profile/${userId}`),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  }) =>
    fetchAPI<User>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// CONTACT ENDPOINTS
export const contact = {
  submitContact: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) =>
    fetchAPI<{ success: boolean }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),
};

// FIRST TIMER / NEW CONVERT ENDPOINTS
export const firstTimer = {
  submitFirstTimer: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  }) =>
    fetchAPI<{ success: boolean }>("/first-timer", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  submitNewConvert: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    testimony: string;
  }) =>
    fetchAPI<{ success: boolean }>("/new-convert", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),
};

// PRAYER ENDPOINTS
export const prayer = {
  submitPrayer: (data: {
    title: string;
    description: string;
    category: string;
  }) =>
    fetchAPI<Prayer>("/prayer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyPrayers: () => fetchAPI<Prayer[]>("/prayer/my"),

  getAdminPrayers: () => fetchAPI<Prayer[]>("/prayer/admin"),

  updatePrayerStatus: (id: string, status: string) =>
    fetchAPI<Prayer>(`/prayer/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// TESTIMONIES ENDPOINTS
export const testimonies = {
  submitTestimony: (data: {
    title: string;
    content: string;
    videoUrl?: string;
  }) =>
    fetchAPI<Testimony>("/testimonies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTestimonies: () => fetchAPI<Testimony[]>("/testimonies"),

  getPendingTestimonies: () =>
    fetchAPI<Testimony[]>("/testimonies/pending"),

  updateTestimonyStatus: (id: string, status: string) =>
    fetchAPI<Testimony>(`/testimonies/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// GIVING ENDPOINTS
export const giving = {
  initializePaystack: (data: {
    amount: number;
    email: string;
    recurring?: boolean;
  }) =>
    fetchAPI<{ authorization_url: string }>("/giving/paystack/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyPaystack: (reference: string) =>
    fetchAPI<{ success: boolean }>("/giving/paystack/verify", {
      method: "POST",
      body: JSON.stringify({ reference }),
    }),

  initializePaypal: (data: { amount: number; currency?: string }) =>
    fetchAPI<{ id: string }>("/giving/paypal/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  capturePaypal: (orderId: string) =>
    fetchAPI<{ success: boolean }>("/giving/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),

  getHistory: () => fetchAPI<any[]>("/giving/history"),

  getRecurring: () => fetchAPI<any[]>("/giving/recurring"),

  cancelRecurring: (subscriptionId: string) =>
    fetchAPI<{ success: boolean }>("/giving/recurring/cancel", {
      method: "POST",
      body: JSON.stringify({ subscriptionId }),
    }),
};

// CITH (CHURCH IN THE HOME) ENDPOINTS
export const cith = {
  getHubs: () => fetchAPI<any[]>("/cith/hubs"),

  getHub: (id: string) => fetchAPI<any>(`/cith/hubs/${id}`),

  joinHub: (id: string) =>
    fetchAPI<{ success: boolean }>(`/cith/hubs/${id}/join`, {
      method: "POST",
    }),

  registerEhub: (data: { name: string; location: string }) =>
    fetchAPI<any>("/cith/ehub/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  applyHub: (data: { name: string; email: string; phone: string }) =>
    fetchAPI<{ success: boolean }>("/cith/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyHub: () => fetchAPI<any>("/cith/my-hub"),

  updateMyHub: (data: any) =>
    fetchAPI<any>("/cith/my-hub", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getAdminApplications: () =>
    fetchAPI<any[]>("/cith/admin/applications"),

  processApplication: (id: string, approved: boolean) =>
    fetchAPI<{ success: boolean }>(`/cith/admin/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ approved }),
    }),

  getAdminHubs: () => fetchAPI<any[]>("/cith/admin/hubs"),

  reassignLeader: (hubId: string, leaderId: string) =>
    fetchAPI<any>("/cith/admin/reassign-leader", {
      method: "POST",
      body: JSON.stringify({ hubId, leaderId }),
    }),
};

// NATION ENDPOINTS
export const nation = {
  createPost: (data: { content: string; imageUrl?: string }) =>
    fetchAPI<Post>("/nation/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getFeed: (limit = 20, offset = 0) =>
    fetchAPI<Post[]>(`/nation/feed?limit=${limit}&offset=${offset}`),

  likePost: (postId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/posts/${postId}/like`, {
      method: "POST",
    }),

  addComment: (postId: string, content: string) =>
    fetchAPI<any>(`/nation/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getComments: (postId: string) =>
    fetchAPI<any[]>(`/nation/posts/${postId}/comments`),

  flagPost: (postId: string, reason: string) =>
    fetchAPI<{ success: boolean }>(`/nation/posts/${postId}/flag`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  getConversations: () =>
    fetchAPI<any[]>("/nation/conversations"),

  getMessages: (conversationId: string) =>
    fetchAPI<Message[]>(`/nation/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, content: string, attachmentUrl?: string) =>
    fetchAPI<Message>(`/nation/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, attachmentUrl }),
    }),

  getGroups: () => fetchAPI<Group[]>("/nation/groups"),

  getGroupFeed: (groupId: string, limit = 20, offset = 0) =>
    fetchAPI<Post[]>(`/nation/groups/${groupId}/feed?limit=${limit}&offset=${offset}`),

  joinGroup: (groupId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/groups/${groupId}/join`, {
      method: "POST",
    }),

  leaveGroup: (groupId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/groups/${groupId}/leave`, {
      method: "POST",
    }),

  getNationProfile: (userId: string) =>
    fetchAPI<any>(`/nation/profiles/${userId}`),

  getNotifications: () =>
    fetchAPI<any[]>("/nation/notifications"),

  markNotificationRead: (notificationId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/notifications/${notificationId}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    fetchAPI<{ success: boolean }>("/nation/notifications/mark-all-read", {
      method: "PATCH",
    }),

  getFlaggedPosts: () =>
    fetchAPI<Post[]>("/nation/admin/flagged-posts"),

  hidePost: (postId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/admin/posts/${postId}/hide`, {
      method: "PATCH",
    }),

  deletePost: (postId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/admin/posts/${postId}`, {
      method: "DELETE",
    }),
};

// INTENTIONALITY CLASS ENDPOINTS
export const intentionalityClass = {
  enroll: (courseId: string) =>
    fetchAPI<{ success: boolean }>(`/class/enroll/${courseId}`, {
      method: "POST",
    }),

  getMyCourses: () =>
    fetchAPI<any[]>("/class/my-courses"),

  getModules: (courseId: string) =>
    fetchAPI<any[]>(`/class/courses/${courseId}/modules`),

  completeModule: (moduleId: string) =>
    fetchAPI<{ success: boolean }>(`/class/modules/${moduleId}/complete`, {
      method: "POST",
    }),

  getLiveSessions: (courseId: string) =>
    fetchAPI<any[]>(`/class/courses/${courseId}/live-sessions`),

  getExam: (courseId: string) =>
    fetchAPI<any>(`/class/courses/${courseId}/exam`),

  submitExam: (examId: string, answers: Record<string, string>) =>
    fetchAPI<{ success: boolean; score: number }>(`/class/exams/${examId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  adminCreateCourse: (data: any) =>
    fetchAPI<any>("/class/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminCreateModule: (courseId: string, data: any) =>
    fetchAPI<any>(`/class/admin/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminCreateQuestion: (examId: string, data: any) =>
    fetchAPI<any>(`/class/admin/exams/${examId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminGetStats: () =>
    fetchAPI<any>("/class/admin/stats"),

  adminGradeExam: (examId: string, data: any) =>
    fetchAPI<any>(`/class/admin/exams/${examId}/grade`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// BLOG ENDPOINTS
export const blog = {
  getPosts: (limit = 10, offset = 0) =>
    fetchAPI<any[]>(`/blog/posts?limit=${limit}&offset=${offset}`),

  getPost: (id: string) =>
    fetchAPI<any>(`/blog/posts/${id}`),

  createBlogPost: (data: {
    title: string;
    content: string;
    imageUrl?: string;
  }) =>
    fetchAPI<any>("/blog/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  publishPost: (id: string) =>
    fetchAPI<any>(`/blog/posts/${id}/publish`, {
      method: "PATCH",
    }),

  addBlogComment: (postId: string, content: string) =>
    fetchAPI<any>(`/blog/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

// MEDIA ENDPOINTS
export const media = {
  getAudioSermons: (limit = 20, offset = 0) =>
    fetchAPI<any[]>(`/media/audio?limit=${limit}&offset=${offset}`),

  getLatestSermon: () =>
    fetchAPI<any>("/media/audio/latest"),

  downloadSermon: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/media/audio/${id}/download`),

  getVideoMessages: (limit = 20, offset = 0) =>
    fetchAPI<any[]>(`/media/video?limit=${limit}&offset=${offset}`),

  createAudioSermon: (data: {
    title: string;
    speaker: string;
    audioUrl: string;
    description?: string;
  }) =>
    fetchAPI<any>("/media/audio", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createVideoMessage: (data: {
    title: string;
    speaker: string;
    videoUrl: string;
    description?: string;
  }) =>
    fetchAPI<any>("/media/video", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLibrary: () =>
    fetchAPI<any[]>("/media/library"),

  createLibraryResource: (data: {
    title: string;
    category: string;
    fileUrl: string;
    description?: string;
  }) =>
    fetchAPI<any>("/media/library", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  downloadLibraryResource: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/media/library/${id}/download`),

  getMusic: () =>
    fetchAPI<any[]>("/media/music"),

  createMusic: (data: {
    title: string;
    artist: string;
    musicUrl: string;
    imageUrl?: string;
  }) =>
    fetchAPI<any>("/media/music", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// EVENTS ENDPOINTS
export const events = {
  getEvents: (limit = 20, offset = 0) =>
    fetchAPI<Event[]>(`/events?limit=${limit}&offset=${offset}`),

  getEvent: (id: string) =>
    fetchAPI<Event>(`/events/${id}`),

  registerForEvent: (id: string) =>
    fetchAPI<{ success: boolean }>(`/events/${id}/register`, {
      method: "POST",
    }),

  registerAndPay: (id: string, data: any) =>
    fetchAPI<any>(`/events/${id}/register-and-pay`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createEvent: (data: any) =>
    fetchAPI<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getEventRegistrations: (eventId: string) =>
    fetchAPI<any[]>(`/events/${eventId}/registrations`),
};

// SQUADS ENDPOINTS
export const squads = {
  getSquads: () =>
    fetchAPI<any[]>("/squads"),

  getSquad: (id: string) =>
    fetchAPI<any>(`/squads/${id}`),

  joinSquad: (id: string) =>
    fetchAPI<{ success: boolean }>(`/squads/${id}/join`, {
      method: "POST",
    }),

  getMySquad: () =>
    fetchAPI<any>("/squads/my-squad"),

  registerKIP: (data: any) =>
    fetchAPI<{ success: boolean }>("/squads/kip/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ANNOUNCEMENTS ENDPOINTS
export const announcements = {
  getAnnouncements: () =>
    fetchAPI<any[]>("/announcements"),

  createAnnouncement: (data: { title: string; content: string }) =>
    fetchAPI<any>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAnnouncement: (id: string, data: any) =>
    fetchAPI<any>(`/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAnnouncement: (id: string) =>
    fetchAPI<{ success: boolean }>(`/announcements/${id}`, {
      method: "DELETE",
    }),
};

// LIVESTREAM ENDPOINTS
export const livestream = {
  getConfig: () =>
    fetchAPI<any>("/livestream/config"),

  toggleLivestream: (active: boolean) =>
    fetchAPI<{ success: boolean }>("/livestream/toggle", {
      method: "POST",
      body: JSON.stringify({ active }),
    }),
};

// ENGAGEMENT ENDPOINTS
export const engagement = {
  recordWatch: (contentId: string, duration: number) =>
    fetchAPI<{ success: boolean }>("/engagement/watch", {
      method: "POST",
      body: JSON.stringify({ contentId, duration }),
    }),

  getStreak: () =>
    fetchAPI<{ currentStreak: number; longestStreak: number }>("/engagement/streak"),

  submitFeedback: (data: { rating: number; comment?: string }) =>
    fetchAPI<{ success: boolean }>("/engagement/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAdminFeedback: () =>
    fetchAPI<any[]>("/engagement/admin/feedback"),
};

// TRAINING ENDPOINTS
export const training = {
  enrollTraining: (trainingId: string) =>
    fetchAPI<{ success: boolean }>(`/training/${trainingId}/enroll`, {
      method: "POST",
    }),

  getAdminEnrollments: () =>
    fetchAPI<any[]>("/training/admin/enrollments"),
};

// ADMIN ENDPOINTS
export const admin = {
  getOverview: () =>
    fetchAPI<any>("/admin/overview"),

  getGivingAnalytics: () =>
    fetchAPI<any>("/admin/analytics/giving"),

  getEngagementAnalytics: () =>
    fetchAPI<any>("/admin/analytics/engagement"),

  getGrowthAnalytics: () =>
    fetchAPI<any>("/admin/analytics/growth"),

  exportGiving: (format = "csv") =>
    fetchAPI<{ downloadUrl: string }>(`/admin/export/giving?format=${format}`),

  getMembers: (limit = 50, offset = 0) =>
    fetchAPI<User[]>(`/admin/members?limit=${limit}&offset=${offset}`),

  updateMemberRole: (userId: string, role: string) =>
    fetchAPI<User>(`/admin/members/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};
