import {
  cloneFallback,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_BLOG_POSTS,
  DEFAULT_LATEST_MESSAGE,
  DEFAULT_LIVESTREAM_CONFIG,
  DEFAULT_MUSIC_TRACKS,
  DEFAULT_SERVICE_SCHEDULE,
  DEFAULT_SQUADS,
  DEFAULT_TESTIMONIES,
  DEFAULT_VIDEO_MESSAGES,
  getDefaultBlogPost,
  getDefaultSquad,
} from "@/lib/public-fallbacks";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ---------------------------------------------------------------------------
// Token management
// The primary auth mechanism is an httpOnly cookie set by the backend on login
// (not readable by JS, immune to XSS). The localStorage token is kept as a
// fallback for the Authorization header so the mobile app and any existing
// sessions continue working without a forced re-login.
// ---------------------------------------------------------------------------
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

/**
 * The only way a login flow should persist a token.
 *
 * The backend sets an httpOnly session cookie, and `fetchAPI` sends it with
 * `credentials: "include"`, so on the web the localStorage copy is redundant —
 * it exists solely as an opt-in for clients that need an Authorization header.
 * Keeping the JS-readable copy off by default means a script-execution bug
 * anywhere on the origin steals a page session rather than a 7-day bearer token.
 *
 * The gate used to live inline in `auth-context`, which meant every other
 * sign-in path (the login page, the OAuth callback, the Google popup) simply
 * called `setToken` and bypassed it — so the protection was never actually on.
 * Routing all of them through here is what makes it a real setting.
 */
export const persistTokenIfEnabled = (token: string | undefined | null): void => {
  if (process.env.NEXT_PUBLIC_STORE_TOKEN !== "true") return;
  if (!token) return;
  setToken(token);
};

// Base fetch wrapper with JWT auth
interface FetchOptions extends RequestInit {
  noAuth?: boolean;
}

// Only GET requests are safe to retry automatically — retrying a POST/PUT/DELETE
// whose response was lost to a network blip risks re-submitting it (e.g. a giving
// charge or a join request going through twice).
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 6;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffMs = (attempt: number) => Math.min(400 * 2 ** (attempt - 1), 6000) + Math.random() * 200;

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
      // Header fallback — used by mobile app and existing web sessions.
      // The httpOnly cookie is sent automatically via credentials: 'include'.
      fetchHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const method = (rest.method || "GET").toUpperCase();
  const isRetryable = method === "GET";
  const maxAttempts = isRetryable ? MAX_ATTEMPTS : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...rest,
        // Send the httpOnly session cookie on every request (cross-origin requires
        // credentials: 'include'; backend CORS must specify credentials: true).
        credentials: "include",
        headers: fetchHeaders,
      });
    } catch (err) {
      if (attempt < maxAttempts) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw err instanceof Error ? err : new Error("Network error");
    }

    if (!response.ok) {
      if (isRetryable && RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt));
        continue;
      }
      const error = await response.json().catch(() => ({}));
      const message = error.message || `API Error: ${response.status}`;
      throw new Error(message);
    }

    // Handle empty responses (204 No Content, or null body)
    const contentLength = response.headers.get("content-length");
    if (response.status === 204 || contentLength === "0") {
      return null as T;
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      return null as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return null as T;
    }
  }

  // Unreachable — the loop always returns or throws — but keeps TS satisfied.
  throw new Error("Request failed");
};

const isEmptyFallbackCandidate = (value: unknown) =>
  value == null || (Array.isArray(value) && value.length === 0);

const resolveFallback = <T>(fallback: T | (() => T)): T =>
  typeof fallback === "function"
    ? (fallback as () => T)()
    : cloneFallback(fallback);

const fetchWithFallback = async <T>(
  request: () => Promise<T>,
  fallback: T | (() => T)
): Promise<T> => {
  try {
    const data = await request();
    return isEmptyFallbackCandidate(data) ? resolveFallback(fallback) : data;
  } catch {
    return resolveFallback(fallback);
  }
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
    credentials: "include",
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
  // Whether the submitter consented to being named if published — set once
  // at submission, not editable afterward.
  shareName: boolean;
  // Whether an admin has actually published this testimony — independent
  // of `status`; a testimony can be approved but still unpublished.
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTestimony {
  id: string;
  title: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
  // The submitter's name if they consented to being named, null otherwise —
  // render as "Anonymous" when absent.
  authorName?: string | null;
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
  authorId: string;
  content: string;
  imageUrl?: string;
  groupId?: string | null;
  flagged: boolean;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    profile?: { firstName?: string; lastName?: string; photoUrl?: string } | null;
  };
  _count?: { likes: number; comments: number };
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

export interface FirstTimerSubmissionResponse {
  message: string;
  id: string;
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

  resendVerification: (email: string) =>
    fetchAPI<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
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

  // Clears the httpOnly session cookie on the backend, then removes the
  // localStorage token so both auth paths are cleaned up together.
  logout: async () => {
    await fetchAPI<void>("/auth/logout", { method: "POST" }).catch(() => {});
    removeToken();
  },
};

// PROFILE ENDPOINTS
export const profile = {
  getProfile: (userId: string) =>
    fetchAPI<User>(`/profile/${userId}`),

  getMyProfile: () =>
    fetchAPI<any>("/profile"),

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
    fetchAPI<FirstTimerSubmissionResponse>("/first-timer", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  submitNewConvert: (data: {
    name: string;
    email: string;
    phone: string;
    preferredSquad?: string;
    preferredHub?: string;
  }) =>
    fetchAPI<FirstTimerSubmissionResponse>("/first-timer/new-convert", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  // Admin endpoints
  adminGetStats: () =>
    fetchAPI<{
      firstTimers: number;
      newConverts: number;
      followedUp: number;
      pendingFollowUp: number;
    }>("/first-timer/admin/stats"),

  adminGetFirstTimers: (search?: string) =>
    fetchAPI<any[]>(
      `/first-timer/admin/first-timers${search ? `?search=${encodeURIComponent(search)}` : ""}`
    ),

  adminGetNewConverts: (search?: string) =>
    fetchAPI<any[]>(
      `/first-timer/admin/new-converts${search ? `?search=${encodeURIComponent(search)}` : ""}`
    ),

  adminUpdateNewConvert: (
    id: string,
    data: {
      assignedSquad?: string;
      assignedHub?: string;
      growthTrack?: string;
      followUpSent?: boolean;
    }
  ) =>
    fetchAPI<any>(`/first-timer/admin/new-converts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDeleteFirstTimer: (id: string) =>
    fetchAPI<any>(`/first-timer/admin/first-timers/${id}`, {
      method: "DELETE",
    }),

  adminDeleteNewConvert: (id: string) =>
    fetchAPI<any>(`/first-timer/admin/new-converts/${id}`, {
      method: "DELETE",
    }),
};

// SERVICE SCHEDULE ENDPOINTS
export const serviceSchedule = {
  getPublic: () =>
    fetchWithFallback(
      () => fetchAPI<any[]>("/service-schedule", { noAuth: true }),
      DEFAULT_SERVICE_SCHEDULE
    ),

  adminGetAll: () =>
    fetchAPI<any[]>("/service-schedule/admin"),

  adminCreate: (data: {
    day: string;
    dayLabel?: string | null;
    name: string;
    time: string;
    description: string;
    order?: number;
    active?: boolean;
  }) =>
    fetchAPI<any>("/service-schedule/admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminUpdate: (
    id: string,
    data: {
      day?: string;
      dayLabel?: string | null;
      name?: string;
      time?: string;
      description?: string;
      order?: number;
      active?: boolean;
    }
  ) =>
    fetchAPI<any>(`/service-schedule/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDelete: (id: string) =>
    fetchAPI<any>(`/service-schedule/admin/${id}`, {
      method: "DELETE",
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

  deletePrayerRequest: (id: string) =>
    fetchAPI<{ message: string }>(`/prayer-requests/admin/${id}`, { method: "DELETE" }),
};

// TESTIMONIES ENDPOINTS
export const testimonies = {
  submitTestimony: (data: {
    title: string;
    content: string;
    photoUrl?: string;
    shareName?: boolean;
  }) =>
    fetchAPI<Testimony>("/testimonies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTestimonies: () =>
    fetchWithFallback(
      () => fetchAPI<PublicTestimony[]>("/testimonies", { noAuth: true }),
      DEFAULT_TESTIMONIES
    ),

  getPendingTestimonies: () =>
    fetchAPI<Testimony[]>("/testimonies/admin/pending"),

  // Approved but not necessarily published yet — for the admin to manage
  // publish state independently of content moderation.
  getApprovedTestimonies: () =>
    fetchAPI<Testimony[]>("/testimonies/admin/approved"),

  updateTestimonyStatus: (id: string, status: "APPROVED" | "REJECTED") =>
    fetchAPI<Testimony>(`/testimonies/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  setTestimonyVisibility: (id: string, isPublic: boolean) =>
    fetchAPI<Testimony>(`/testimonies/admin/${id}/visibility`, {
      method: "PUT",
      body: JSON.stringify({ isPublic }),
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
    fetchAPI<{ orderId: string; reference: string; approvalUrl: string }>("/giving/initialize-paypal", {
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
  getHubs: () =>
    fetchAPI<any[]>("/cith/hubs", { noAuth: true }),

  getHub: (id: string) =>
    fetchAPI<any>(`/cith/hubs/${id}`, { noAuth: true }),

  joinHub: (id: string, reason?: string) =>
    fetchAPI<{ success: boolean }>(`/cith/hubs/${id}/join`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  getMyHubJoinRequests: () => fetchAPI<any[]>("/cith/my-hub/join-requests"),

  reviewMyHubJoinRequest: (id: string, approved: boolean, reason?: string, meetingPointId?: string) =>
    fetchAPI<any>(`/cith/my-hub/join-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: approved ? "APPROVED" : "REJECTED",
        ...(reason ? { reason } : {}),
        ...(meetingPointId ? { meetingPointId } : {}),
      }),
    }),

  getAdminJoinRequests: () => fetchAPI<any[]>("/admin/cith/join-requests"),

  reviewJoinRequest: (id: string, approved: boolean, reason?: string, meetingPointId?: string) =>
    fetchAPI<any>(`/admin/cith/join-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: approved ? "APPROVED" : "REJECTED",
        ...(reason ? { reason } : {}),
        ...(meetingPointId ? { meetingPointId } : {}),
      }),
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

  createHub: (data: {
    name: string; leaderId: string; area: string; city: string;
    state: string; country?: string; meetingDay: string; meetingTime: string; capacity?: number;
  }) =>
    fetchAPI<any>("/admin/cith/hubs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateHub: (hubId: string, data: {
    name?: string; address?: string; area?: string; city?: string; state?: string;
    country?: string; meetingDay?: string; meetingTime?: string; capacity?: number; status?: string;
  }) =>
    fetchAPI<any>(`/admin/cith/hubs/${hubId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  reassignLeader: (hubId: string, newLeaderId: string) =>
    fetchAPI<any>(`/admin/cith/hubs/${hubId}/leader`, {
      method: "PUT",
      body: JSON.stringify({ newLeaderId }),
    }),

  searchMembers: (query: string) =>
    fetchAPI<any[]>(`/admin/cith/members/search?q=${encodeURIComponent(query)}`),

  deleteHub: (hubId: string) =>
    fetchAPI<{ message: string }>(`/admin/cith/hubs/${hubId}`, { method: "DELETE" }),

  createMeetingPoint: (hubId: string, data: {
    homeGiverName: string; address: string; churchServantName: string; assistantChurchServantName?: string;
  }) =>
    fetchAPI<any>(`/admin/cith/hubs/${hubId}/meeting-points`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMeetingPoint: (id: string, data: {
    homeGiverName?: string; address?: string; churchServantName?: string; assistantChurchServantName?: string;
  }) =>
    fetchAPI<any>(`/admin/cith/meeting-points/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMeetingPoint: (id: string) =>
    fetchAPI<{ message: string }>(`/admin/cith/meeting-points/${id}`, { method: "DELETE" }),
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

  deleteOwnPost: (postId: string) =>
    fetchAPI<any>(`/nation/posts/${postId}`, {
      method: "DELETE",
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

  adminGetCourses: () =>
    fetchAPI<any[]>("/admin/class/courses"),

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

  adminUpdateModule: (moduleId: string, data: any) =>
    fetchAPI<any>(`/admin/class/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDeleteModule: (moduleId: string) =>
    fetchAPI<any>(`/admin/class/modules/${moduleId}`, {
      method: "DELETE",
    }),

  adminUpdateQuestion: (questionId: string, data: any) =>
    fetchAPI<any>(`/admin/class/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDeleteQuestion: (questionId: string) =>
    fetchAPI<any>(`/admin/class/questions/${questionId}`, {
      method: "DELETE",
    }),

  adminGetEnrollments: (courseId?: string) =>
    fetchAPI<any[]>(`/admin/class/enrollments${courseId ? `?courseId=${courseId}` : ""}`),

  adminDeleteCourse: (courseId: string) =>
    fetchAPI<{ message: string }>(`/admin/class/courses/${courseId}`, { method: "DELETE" }),
};

// BLOG ENDPOINTS
export const blog = {
  getPosts: (limit = 10, offset = 0) =>
    fetchWithFallback(
      () => fetchAPI<any[]>(`/blog?limit=${limit}&offset=${offset}`, { noAuth: true }),
      () => cloneFallback(DEFAULT_BLOG_POSTS.slice(offset, offset + limit))
    ),

  getPost: (slug: string) =>
    fetchWithFallback(
      () => fetchAPI<any>(`/blog/${slug}`, { noAuth: true }),
      () => getDefaultBlogPost(slug)
    ),

  createBlogPost: (data: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    imageUrl?: string;
  }) =>
    fetchAPI<any>("/blog", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBlogPost: (id: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    imageUrl?: string;
  }) =>
    fetchAPI<any>(`/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteBlogPost: (id: string) =>
    fetchAPI<{ success: boolean }>(`/blog/${id}`, {
      method: "DELETE",
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
    fetchWithFallback(
      () => fetchAPI<any>("/sermons/audio/latest", { noAuth: true }),
      DEFAULT_LATEST_MESSAGE
    ),

  downloadSermon: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/sermons/audio/${id}/download`, { noAuth: true }),

  getVideoMessages: (series?: string) =>
    fetchWithFallback(
      () => fetchAPI<any[]>(`/sermons/video${series ? `?series=${series}` : ""}`, { noAuth: true }),
      () =>
        cloneFallback(
          DEFAULT_VIDEO_MESSAGES.filter((video) => !series || video.series === series)
        )
    ),

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
        isFree: data.isFree ?? false,
      }),
    }),

  downloadLibraryResource: (id: string) =>
    fetchAPI<{ downloadUrl: string }>(`/library/${id}/download`),

  getLibraryAccess: (id: string) =>
    fetchAPI<{ fileUrl: string }>(`/library/${id}/access`),

  // Creates the Paystack transaction on the server, at the price the server
  // holds for this resource. The browser no longer states an amount or invents
  // a reference — doing so let a buyer charge themselves ₦100 for a ₦20,000
  // resource, since nothing server-side had recorded what was owed.
  initializeLibraryPurchase: (id: string) =>
    fetchAPI<{ reference: string; authorization_url: string; access_code: string }>(
      `/library/${id}/purchase/initialize`,
      { method: "POST" },
    ),

  verifyLibraryPurchase: (id: string, reference: string) =>
    fetchAPI<{ fileUrl: string; message?: string }>(`/library/${id}/purchase/verify`, {
      method: "POST",
      body: JSON.stringify({ reference }),
    }),

  getMusic: () =>
    fetchWithFallback(
      () => fetchAPI<any[]>("/music", { noAuth: true }),
      DEFAULT_MUSIC_TRACKS
    ),

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

  updateVideoMessage: (id: string, data: any) =>
    fetchAPI<any>(`/sermons/video/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteVideoMessage: (id: string) =>
    fetchAPI<any>(`/sermons/video/${id}`, { method: "DELETE" }),

  updateAudioSermon: (id: string, data: any) =>
    fetchAPI<any>(`/sermons/audio/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteAudioSermon: (id: string) =>
    fetchAPI<any>(`/sermons/audio/${id}`, { method: "DELETE" }),

  updateLibraryResource: (id: string, data: any) =>
    fetchAPI<any>(`/library/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteLibraryResource: (id: string) =>
    fetchAPI<any>(`/library/${id}`, { method: "DELETE" }),

  updateMusicTrack: (id: string, data: any) =>
    fetchAPI<any>(`/music/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteMusicTrack: (id: string) =>
    fetchAPI<any>(`/music/${id}`, { method: "DELETE" }),
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

  updateEvent: (id: string, data: any) =>
    fetchAPI<any>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getEventRegistrations: (eventId: string) =>
    fetchAPI<any[]>(`/events/${eventId}/registrations`),

  deleteEvent: (id: string) =>
    fetchAPI<{ message: string }>(`/events/${id}`, { method: "DELETE" }),
};

// SQUADS ENDPOINTS
export const squads = {
  getSquads: () =>
    fetchWithFallback(
      () => fetchAPI<any[]>("/squads"),
      DEFAULT_SQUADS
    ),

  getSquad: (id: string) =>
    fetchWithFallback(
      () => fetchAPI<any>(`/squads/${id}`),
      () => getDefaultSquad(id)
    ),

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

// GALLERY ENDPOINTS
export const gallery = {
  getImages: () =>
    fetchAPI<any[]>("/gallery", { noAuth: true }),

  addImage: (data: { url: string; caption?: string; order?: number }) =>
    fetchAPI<any>("/gallery", { method: "POST", body: JSON.stringify(data) }),

  updateImage: (id: string, data: { caption?: string; order?: number }) =>
    fetchAPI<any>(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteImage: (id: string) =>
    fetchAPI<{ message: string }>(`/gallery/${id}`, { method: "DELETE" }),
};

// ANNOUNCEMENTS ENDPOINTS
export const announcements = {
  getAnnouncements: () =>
    fetchWithFallback(
      () => fetchAPI<any[]>("/announcements"),
      DEFAULT_ANNOUNCEMENTS
    ),

  getAll: () =>
    fetchAPI<any[]>("/announcements/admin/all"),

  createAnnouncement: (data: { title: string; content: string; published?: boolean }) =>
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
    fetchWithFallback(
      () => fetchAPI<any>("/livestream/config", { noAuth: true }),
      DEFAULT_LIVESTREAM_CONFIG
    ),

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
export type TrainingCourseStatus = "UPCOMING" | "IN_SESSION" | "ENDED";

export interface TrainingCourse {
  id: string;
  program: "KISOLAM" | "TEMA";
  code: string;
  name: string;
  description: string;
  duration: string;
  feeType: "FIXED" | "VARIABLE";
  fee: number | null;
  feeCurrency: string;
  streams: string[];
  startDate: string | null;
  endDate: string | null;
  registrationOpen: boolean;
  isActive: boolean;
  displayOrder: number;
  status: TrainingCourseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCourseInput {
  program: "KISOLAM" | "TEMA";
  code: string;
  name: string;
  description: string;
  duration: string;
  feeType: "FIXED" | "VARIABLE";
  fee?: number;
  feeCurrency?: string;
  streams?: string[];
  startDate?: string;
  endDate?: string;
  registrationOpen?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export const training = {
  enrollTraining: (program: string, data: { name: string; email: string; phone: string; courseId?: string; additionalInfo?: Record<string, unknown> }) =>
    fetchAPI<{ message: string; id: string }>(`/training/${program}/enroll`, {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  getEnrollment: (id: string) =>
    fetchAPI<any>(`/training/enrollment/${id}`, { noAuth: true }),

  initializePayment: (data: { enrollmentId: string; amount: number; email: string; name: string; program: string }) =>
    fetchAPI<{ reference: string; authorization_url: string; enrollmentId: string }>("/training/payment/initialize", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),

  verifyPayment: (reference: string) =>
    fetchAPI<{ message: string; status: string; enrollmentId: string }>(`/training/payment/verify/${reference}`, { noAuth: true }),

  getAdminEnrollments: (program?: string) =>
    fetchAPI<any[]>(`/training/admin/enrollments${program ? `?program=${program}` : ""}`),

  adminUpdateEnrollment: (id: string, data: { trackingStatus?: string; notes?: string }) =>
    fetchAPI<any>(`/training/admin/enrollments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDeleteEnrollment: (id: string) =>
    fetchAPI<{ message: string }>(`/training/admin/enrollments/${id}`, {
      method: "DELETE",
    }),

  getCourses: (program?: string) =>
    fetchAPI<TrainingCourse[]>(`/training/courses${program ? `?program=${program}` : ""}`, { noAuth: true }),

  getAdminCourses: (program?: string) =>
    fetchAPI<TrainingCourse[]>(`/training/admin/courses${program ? `?program=${program}` : ""}`),

  createCourse: (data: TrainingCourseInput) =>
    fetchAPI<TrainingCourse>("/training/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCourse: (id: string, data: Partial<TrainingCourseInput>) =>
    fetchAPI<TrainingCourse>(`/training/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCourse: (id: string) =>
    fetchAPI<{ message: string }>(`/training/admin/courses/${id}`, {
      method: "DELETE",
    }),
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
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    window.open(`${base}/admin/giving/export${period ? `?period=${period}` : ""}`, "_blank");
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

  deleteMember: (userId: string) =>
    fetchAPI<{ message: string }>(`/admin/members/${userId}`, { method: "DELETE" }),
};
