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

// File upload helper (multipart/form-data, no JSON content-type)
export const uploadFile = async (
  endpoint: string,
  file: File,
): Promise<{ url: string }> => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Upload failed: ${response.status}`);
  }

  return response.json();
};

// Upload endpoints
export const upload = {
  profilePhoto: (file: File) => uploadFile("/upload/profile-photo", file),
  image: (file: File) => uploadFile("/upload/image", file),
  audio: (file: File) => uploadFile("/upload/audio", file),
  pdf: (file: File) => uploadFile("/upload/pdf", file),
  music: (file: File) => uploadFile("/upload/music", file),
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
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    occupation?: string;
    maritalStatus?: string;
    photoUrl?: string;
    ministryInvolvement?: string;
  }) =>
    fetchAPI<User>("/profile", {
      method: "PUT",
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
    name: string;
    email: string;
    phone: string;
    source: string;
  }) =>
    fetchAPI<{ success: boolean }>("/first-timer", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  submitNewConvert: (data: {
    name: string;
    email: string;
    phone: string;
  }) =>
    fetchAPI<{ success: boolean }>("/first-timer/new-convert", {
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

  updatePrayerStatus: (id: string, status: string, adminNotes?: string) =>
    fetchAPI<Prayer>(`/prayer-requests/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, ...(adminNotes ? { adminNotes } : {}) }),
    }),
};

// TESTIMONIES ENDPOINTS
export const testimonies = {
  submitTestimony: (data: {
    title: string;
    content: string;
    photoUrl?: string;
  }) =>
    fetchAPI<Testimony>("/testimonies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTestimonies: () => fetchAPI<Testimony[]>("/testimonies", { noAuth: true }),

  getPendingTestimonies: () =>
    fetchAPI<Testimony[]>("/testimonies/admin/pending"),

  updateTestimonyStatus: (id: string, status: "APPROVED" | "REJECTED") =>
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

// CITH (CHURCH IN THE HOUSE) ENDPOINTS
export const cith = {
  getHubs: () => fetchAPI<any[]>("/cith/hubs"),

  getHub: (id: string) => fetchAPI<any>(`/cith/hubs/${id}`),

  joinHub: (id: string) =>
    fetchAPI<{ success: boolean }>(`/cith/hubs/${id}/join`, {
      method: "POST",
    }),

  registerEhub: (data: { name: string; email: string; phone: string; location: string }) =>
    fetchAPI<any>("/cith/ehub/register", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  applyHub: (data: {
    address: string;
    area: string;
    city: string;
    state: string;
    preferredDay: string;
    preferredTime: string;
    capacity?: number;
  }) =>
    fetchAPI<{ success: boolean }>("/cith/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyHub: () => fetchAPI<any>("/cith/my-hub"),

  updateMyHub: (data: { meetingDay?: string; meetingTime?: string }) =>
    fetchAPI<any>("/cith/my-hub", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getAdminApplications: () =>
    fetchAPI<any[]>("/admin/cith/applications"),

  processApplication: (id: string, approved: boolean, reason?: string) =>
    fetchAPI<any>(`/admin/cith/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: approved ? "APPROVED" : "REJECTED",
        ...(reason ? { reason } : {}),
      }),
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

  getFeed: (page = 1) =>
    fetchAPI<Post[]>(`/nation/feed?page=${page}`),

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
    fetchAPI<any[]>("/nation/messages/conversations"),

  getMessages: (userId: string) =>
    fetchAPI<Message[]>(`/nation/messages/${userId}`),

  sendMessage: (userId: string, content: string) =>
    fetchAPI<Message>(`/nation/messages/${userId}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getGroups: () => fetchAPI<Group[]>("/nation/groups"),

  getGroupFeed: (groupId: string, page = 1) =>
    fetchAPI<Post[]>(`/nation/groups/${groupId}/feed?page=${page}`),

  joinGroup: (groupId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/groups/${groupId}/join`, {
      method: "POST",
    }),

  leaveGroup: (groupId: string) =>
    fetchAPI<{ success: boolean }>(`/nation/groups/${groupId}/leave`, {
      method: "DELETE",
    }),

  getNationProfile: (userId: string) =>
    fetchAPI<any>(`/nation/profiles/${userId}`),

  getNotifications: () =>
    fetchAPI<any[]>("/nation/notifications"),

  markNotificationRead: (notificationId: string) =>
    fetchAPI<any>(`/nation/notifications/${notificationId}/read`, {
      method: "PUT",
    }),

  markAllRead: () =>
    fetchAPI<any>("/nation/notifications/read-all", {
      method: "PUT",
    }),

  getFlaggedPosts: () =>
    fetchAPI<Post[]>("/admin/nation/flagged"),

  hidePost: (postId: string) =>
    fetchAPI<any>(`/admin/nation/posts/${postId}/hide`, {
      method: "PUT",
    }),

  deletePost: (postId: string) =>
    fetchAPI<any>(`/admin/nation/posts/${postId}`, {
      method: "DELETE",
    }),
};

// INTENTIONALITY CLASS ENDPOINTS
export const intentionalityClass = {
  getAvailableCourses: () =>
    fetchAPI<any[]>("/class/courses", { noAuth: true }),

  enroll: (courseId: string) =>
    fetchAPI<{ success: boolean }>(`/class/enroll/${courseId}`, {
      method: "POST",
    }),

  getMyCourses: () =>
    fetchAPI<any[]>("/class/my-courses"),

  getModules: (courseId: string) =>
    fetchAPI<any[]>(`/class/courses/${courseId}/modules`),

  completeModule: (moduleId: string, enrollmentId: string) =>
    fetchAPI<{ success: boolean }>(`/class/modules/${moduleId}/complete`, {
      method: "POST",
      body: JSON.stringify({ enrollmentId }),
    }),

  getLiveSessions: (courseId: string) =>
    fetchAPI<any[]>(`/class/courses/${courseId}/live-sessions`),

  getExam: (courseId: string) =>
    fetchAPI<any>(`/class/courses/${courseId}/exam`),

  submitExam: (courseId: string, data: { enrollmentId: string; answers: Record<string, string> }) =>
    fetchAPI<any>(`/class/courses/${courseId}/exam`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminCreateCourse: (data: any) =>
    fetchAPI<any>("/admin/class/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminCreateModule: (data: any) =>
    fetchAPI<any>("/admin/class/modules", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminCreateQuestion: (data: any) =>
    fetchAPI<any>("/admin/class/questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminGetStats: () =>
    fetchAPI<any>("/admin/class/stats"),

  adminGradeExam: (submissionId: string, data: { manualScore: number }) =>
    fetchAPI<any>(`/admin/class/exam/${submissionId}/grade`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// BLOG ENDPOINTS
export const blog = {
  getPosts: (limit = 10, offset = 0) =>
    fetchAPI<any[]>(`/blog?limit=${limit}&offset=${offset}`, { noAuth: true }),

  getPost: (slug: string) =>
    fetchAPI<any>(`/blog/${slug}`, { noAuth: true }),

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
    }).toString()}`, { noAuth: true }),

  getLatestSermon: () =>
    fetchAPI<any>("/sermons/audio/latest", { noAuth: true }),

  downloadSermon: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/sermons/audio/${id}/download`, { noAuth: true }),

  getVideoMessages: (series?: string) =>
    fetchAPI<any[]>(`/sermons/video${series ? `?series=${series}` : ""}`, { noAuth: true }),

  createAudioSermon: (data: {
    title: string;
    speaker: string;
    audioUrl: string;
    description?: string;
    series?: string;
    topic?: string;
    duration?: number;
    date?: string;
  }) =>
    fetchAPI<any>("/sermons/audio", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        date: data.date || new Date().toISOString(),
      }),
    }),

  createVideoMessage: (data: {
    title: string;
    youtubeUrl: string;
    description?: string;
    series?: string;
    topic?: string;
    date?: string;
  }) =>
    fetchAPI<any>("/sermons/video", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        date: data.date || new Date().toISOString(),
      }),
    }),

  getLibrary: () =>
    fetchAPI<any[]>("/library", { noAuth: true }),

  createLibraryResource: (data: {
    title: string;
    author: string;
    fileUrl: string;
    description?: string;
    coverUrl?: string;
    type?: string;
    price?: number;
    isFree?: boolean;
  }) =>
    fetchAPI<any>("/library", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        type: data.type || "BOOK",
        isFree: data.isFree ?? true,
      }),
    }),

  downloadLibraryResource: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/library/${id}/download`, { noAuth: true }),

  getMusic: () =>
    fetchAPI<any[]>("/music", { noAuth: true }),

  createMusic: (data: {
    title: string;
    audioUrl: string;
    album?: string;
    artworkUrl?: string;
    duration?: number;
    price?: number;
  }) =>
    fetchAPI<any>("/music", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// EVENTS ENDPOINTS
export const events = {
  getEvents: (limit = 20, offset = 0) =>
    fetchAPI<Event[]>(`/events?limit=${limit}&offset=${offset}`, { noAuth: true }),

  getEvent: (id: string) =>
    fetchAPI<Event>(`/events/${id}`, { noAuth: true }),

  registerForEvent: (id: string, data: { name: string; email: string; phone?: string }) =>
    fetchAPI<{ success: boolean }>(`/events/${id}/register`, {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  registerAndPay: (id: string, data: { name: string; email: string; phone?: string }) =>
    fetchAPI<any>(`/events/${id}/register-and-pay`, {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
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

  // Admin
  createSquad: (data: {
    name: string; description: string; leaderId: string;
    meetingDay?: string; meetingTime?: string; activities?: string;
  }) =>
    fetchAPI<any>("/admin/squads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSquad: (id: string, data: any) =>
    fetchAPI<any>(`/admin/squads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSquad: (id: string) =>
    fetchAPI<any>(`/admin/squads/${id}`, {
      method: "DELETE",
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
    fetchAPI<any>("/livestream/config", { noAuth: true }),

  updateLivestream: (data: {
    isLive: boolean;
    embedUrl?: string;
    nextService?: string;
  }) =>
    fetchAPI<{ success: boolean }>("/livestream/toggle", {
      method: "PUT",
      body: JSON.stringify(data),
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
  enrollTraining: (program: string, data: { name: string; email: string; phone: string; additionalInfo?: Record<string, unknown> }) =>
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
