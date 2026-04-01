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
  role: string;
  emailVerified: boolean;
  profile: {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  };
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
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
    name: string;
    email: string;
    request: string;
    isPublic?: boolean;
  }) =>
    fetchAPI<{ message: string; id: string }>("/prayer-requests", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  getMyPrayers: () => fetchAPI<Prayer[]>("/prayer-requests/mine"),

  getAdminPrayers: (status?: string) =>
    fetchAPI<Prayer[]>(`/prayer-requests/admin${status ? `?status=${status}` : ""}`),

  updatePrayerStatus: (id: string, status: string) =>
    fetchAPI<Prayer>(`/prayer-requests/admin/${id}`, {
      method: "PUT",
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
    fetchAPI<Testimony[]>("/testimonies/admin/pending"),

  updateTestimonyStatus: (id: string, status: string) =>
    fetchAPI<Testimony>(`/testimonies/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// GIVING ENDPOINTS
export const giving = {
  initializePaystack: (data: {
    amount: number;
    currency: string;
    category: string;
    email: string;
    name?: string;
    isRecurring?: boolean;
  }) =>
    fetchAPI<{ authorization_url: string; reference: string }>("/giving/initialize-paystack", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  verifyPaystack: (reference: string) =>
    fetchAPI<{ message: string; status: string }>("/giving/verify-paystack", {
      method: "POST",
      body: JSON.stringify({ reference }),
      noAuth: true,
    }),

  initializePaypal: (data: {
    amount: number;
    currency: string;
    category: string;
    email: string;
    name?: string;
  }) =>
    fetchAPI<{ orderId: string; reference: string }>("/giving/initialize-paypal", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  capturePaypal: (orderId: string) =>
    fetchAPI<{ message: string; status: string }>("/giving/capture-paypal", {
      method: "POST",
      body: JSON.stringify({ orderId }),
      noAuth: true,
    }),

  getHistory: () => fetchAPI<any[]>("/giving/history"),

  getRecurring: () => fetchAPI<any[]>("/giving/recurring"),

  cancelRecurring: (id: string) =>
    fetchAPI<{ message: string }>(`/giving/recurring/${id}`, {
      method: "DELETE",
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
    fetchAPI<any[]>("/admin/cith/applications"),

  processApplication: (id: string, approved: boolean) =>
    fetchAPI<any>(`/admin/cith/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: approved ? "APPROVED" : "REJECTED" }),
    }),

  getAdminHubs: () => fetchAPI<any[]>("/admin/cith/hubs"),

  reassignLeader: (hubId: string, newLeaderId: string) =>
    fetchAPI<any>(`/admin/cith/hubs/${hubId}/leader`, {
      method: "PUT",
      body: JSON.stringify({ newLeaderId }),
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
    fetchAPI<any[]>(`/blog?limit=${limit}&offset=${offset}`),

  getPost: (slug: string) =>
    fetchAPI<any>(`/blog/${slug}`),

  createBlogPost: (data: {
    title: string;
    content: string;
    imageUrl?: string;
  }) =>
    fetchAPI<any>("/blog", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  publishPost: (id: string) =>
    fetchAPI<any>(`/blog/${id}/publish`, {
      method: "PUT",
    }),

  addBlogComment: (postId: string, content: string) =>
    fetchAPI<any>(`/blog/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

// MEDIA ENDPOINTS
export const media = {
  getAudioSermons: (search?: string, topic?: string, series?: string) =>
    fetchAPI<any[]>(`/sermons/audio?${new URLSearchParams({
      ...(search ? { search } : {}),
      ...(topic ? { topic } : {}),
      ...(series ? { series } : {}),
    }).toString()}`),

  getLatestSermon: () =>
    fetchAPI<any>("/sermons/audio/latest"),

  downloadSermon: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/sermons/audio/${id}/download`),

  getVideoMessages: (series?: string) =>
    fetchAPI<any[]>(`/sermons/video${series ? `?series=${series}` : ""}`),

  createAudioSermon: (data: {
    title: string;
    speaker: string;
    audioUrl: string;
    description?: string;
  }) =>
    fetchAPI<any>("/sermons/audio", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createVideoMessage: (data: {
    title: string;
    speaker: string;
    videoUrl: string;
    description?: string;
  }) =>
    fetchAPI<any>("/sermons/video", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLibrary: () =>
    fetchAPI<any[]>("/library"),

  createLibraryResource: (data: {
    title: string;
    category: string;
    fileUrl: string;
    description?: string;
  }) =>
    fetchAPI<any>("/library", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  downloadLibraryResource: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/library/${id}/download`),

  getMusic: () =>
    fetchAPI<any[]>("/music"),

  createMusic: (data: {
    title: string;
    artist: string;
    musicUrl: string;
    imageUrl?: string;
  }) =>
    fetchAPI<any>("/music", {
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

  registerKIP: (data: { name: string; email: string; phone: string }) =>
    fetchAPI<{ success: boolean }>("/kip/register", {
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
      method: "PUT",
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
  recordWatch: () =>
    fetchAPI<any>("/engagement/watch", {
      method: "POST",
    }),

  getStreak: () =>
    fetchAPI<{ currentStreak: number; longestStreak: number; badges: any[] }>("/engagement/streak"),

  submitFeedback: (sermonId: string, data: { rating: number; comment?: string }) =>
    fetchAPI<any>(`/engagement/sermons/${sermonId}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAdminFeedback: (sermonId: string) =>
    fetchAPI<any>(`/engagement/admin/sermons/${sermonId}/feedback`),
};

// TRAINING ENDPOINTS
export const training = {
  enrollTraining: (program: string, data: { name: string; email: string; phone: string }) =>
    fetchAPI<{ message: string; id: string }>(`/training/${program}/enroll`, {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  getAdminEnrollments: () =>
    fetchAPI<any[]>("/training/admin/enrollments"),
};

// ADMIN ENDPOINTS
export const admin = {
  getOverview: () =>
    fetchAPI<any>("/admin/analytics/overview"),

  getGivingAnalytics: (period?: string) =>
    fetchAPI<any>(`/admin/analytics/giving${period ? `?period=${period}` : ""}`),

  getEngagementAnalytics: () =>
    fetchAPI<any>("/admin/analytics/engagement"),

  getGrowthAnalytics: () =>
    fetchAPI<any>("/admin/analytics/growth"),

  exportGiving: (period?: string) => {
    const token = getToken();
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    window.open(`${base}/admin/giving/export${period ? `?period=${period}` : ""}${token ? `&token=${token}` : ""}`, "_blank");
  },

  getMembers: (page = 1, search?: string, role?: string) =>
    fetchAPI<{ members: User[]; total: number; page: number; totalPages: number }>(
      `/admin/members?page=${page}${search ? `&search=${search}` : ""}${role ? `&role=${role}` : ""}`
    ),

  updateMemberRole: (userId: string, role: string) =>
    fetchAPI<User>(`/admin/members/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
};
