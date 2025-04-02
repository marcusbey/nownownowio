const API_BASE_URL = '/api/v1';

export const ENDPOINTS = {
  // Auth
  AUTH_SESSION: `${API_BASE_URL}/auth/session`,
  AUTH_SIGNIN: `${API_BASE_URL}/auth/signin`,
  AUTH_SIGNOUT: `${API_BASE_URL}/auth/signout`,
  AUTH_VERIFY_REQUEST: `${API_BASE_URL}/auth/verify-request`,
  AUTH_PROVIDERS: `${API_BASE_URL}/auth/providers`,
  AUTH_VALIDATE: `${API_BASE_URL}/auth/validate`,
  
  // Organizations
  ORGANIZATIONS: `${API_BASE_URL}/organizations`,
  ORGANIZATION_BY_ID: (orgId: string) => `${API_BASE_URL}/organizations/${orgId}`,
  ORGANIZATION_USERS: (orgId: string) => `${API_BASE_URL}/organizations/${orgId}/users`,
  ORGANIZATION_USER: (orgId: string, userId: string) => `${API_BASE_URL}/organizations/${orgId}/users/${userId}`,
  ORGANIZATION_FIRST: `${API_BASE_URL}/organizations/first`,
  ORGANIZATION_BY_SLUG: (slug: string) => `${API_BASE_URL}/organizations/${slug}`,
  
  // Account
  ACCOUNT_PROFILE: `${API_BASE_URL}/account/profile`,
  ACCOUNT_PASSWORD: `${API_BASE_URL}/account/password`,
  ACCOUNT_EMAIL: `${API_BASE_URL}/account/email`,
  ACCOUNT_DELETE: `${API_BASE_URL}/account/delete`,
  ACCOUNT_VERIFY_EMAIL: `${API_BASE_URL}/account/verify-email`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/payments`,
  PAYMENT_CHECKOUT: `${API_BASE_URL}/payments/create-checkout`,
  PAYMENT_PORTAL: `${API_BASE_URL}/payments/create-portal`,
  
  // Posts
  POSTS: `${API_BASE_URL}/posts`,
  POSTS_FOR_YOU: `${API_BASE_URL}/posts/for-you`,
  POSTS_BOOKMARKS: `${API_BASE_URL}/posts/bookmarks`,
  POSTS_EXPLORE: `${API_BASE_URL}/posts/explore`,
  POST_DETAIL: (postId: string) => `${API_BASE_URL}/posts/${postId}`,
  POST_VIEWS: (postId: string) => `${API_BASE_URL}/posts/${postId}/views`,
  TRACK_VIEW: `${API_BASE_URL}/posts/track-view`,
  POST_LIKE: (postId: string) => `${API_BASE_URL}/posts/${postId}/like`,
  POST_BOOKMARK: (postId: string) => `${API_BASE_URL}/posts/${postId}/bookmark`,
  POST_COMMENTS: (postId: string) => `${API_BASE_URL}/posts/${postId}/comments`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  
  // Webhooks
  WEBHOOK_RESEND: `${API_BASE_URL}/webhooks/resend`,
  WEBHOOK_STRIPE: `${API_BASE_URL}/webhooks/stripe`,
  
  // Upload
  UPLOAD_THING: `${API_BASE_URL}/uploadthing`,
  WHO_TO_FOLLOW: `${API_BASE_URL}/posts/for-you/who-to-follow`,
  TRENDING_TOPICS: `${API_BASE_URL}/posts/for-you/trending-topics`,
  
  // Widget
  WIDGET_GENERATE: `${API_BASE_URL}/widget/generate-script`,
  
  // Support
  SUPPORT_CONTACT: `${API_BASE_URL}/support/contact`,
  SUPPORT_FEEDBACK: `${API_BASE_URL}/support/feedback`,
} as const;
