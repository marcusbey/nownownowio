import { ConfigProps } from "@/types/config";

export const SiteConfig = {
  // Core Configuration
  title: "Now now now...What next?",
  description: "Document the journey, Share how much you care",
  prodUrl: "https://nownownow.io",
  domain: "nownownow.io",
  appIcon: "/images/icon.png",
  appName: "NowNowNow",
  company: {
    name: "BASE32 Inc.",
    address: "Quebec CANADA",
  },
  brand: {
    primary: "#007291",
  },
  email: {
    from: "NOWNOWNOW <contact@base32.tech>",
    contact: "contact@base32.tech",
  },
  maker: {
    image: "https://pbs.twimg.com/profile_images/1233781055758512130/tpvF4g55_400x400.jpg",
    website: "https://www.romainboboe.com",
    twitter: "https://twitter.com/romainbey",
    name: "Romain",
  },
  // Stripe Configuration
  // AWS Configuration
  aws: {
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },

  // Auth Configuration
  auth: {
    loginUrl: "/api/auth/signin",
    callbackUrl: "/home",
    loginLinkSecret: process.env.NEXTAUTH_SECRET as string,
  },

  // Analytics Configuration
  analytics: {
    vercelAnalytics: {
      projectId: process.env.VERCEL_ANALYTICS_ID,
    },
  },

  // Email Configuration
  mailgun: {
    subdomain: "resend",
    fromNoReply: `ShipFast <noreply@rsd.nownownow.io>`,
    fromAdmin: `Romain at Base32 <hello@nownownow.io>`,
    fromSupport: "NOWNOWNOW Support <contact@base32.tech>",
    supportEmail: "hello@nownownow.io",
    forwardRepliesTo: "rboboe@base32.tech",
    replyToEmail: "contact@base32.tech",
  },

  // Stripe Configuration
  stripe: {
    plans: [
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_456",
        name: "Free",
        description: "Perfect for getting started",
        price: 0,
        features: [
          { name: "7-day status lifetime" },
          { name: "100 weekly impressions" },
          { name: "Basic analytics (24h retention)" },
          { name: "Single team member" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_456",
        name: "Premium",
        description: "For growing teams and businesses",
        price: 29,
        isFeatured: true,
        features: [
          { name: "Permanent status preservation" },
          { name: "Unlimited impressions" },
          { name: "10GB image storage" },
          { name: "GPT-4 integration" },
          { name: "Advanced analytics (30d)" },
          { name: "Custom domain" },
          { name: "Up to 5 team members" },
          { name: "Priority support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_lifetime"
            : "price_789",
        name: "Lifetime",
        description: "One-time purchase, lifetime access",
        price: 299,
        isOneTime: true,
        features: [
          { name: "All Premium features" },
          { name: "Unlimited storage" },
          { name: "Early access to features" },
          { name: "Dedicated account manager" },
          { name: "Custom branding options" },
          { name: "Unlimited team members" },
          { name: "Unlimited domains" },
        ],
      },
    ],
  },

  // Crisp Configuration
  crisp: {
    id: "",
    onlyShowOnRoutes: ["/"],
  },

  // Feature Flags
  features: {
    /**
     * If enable, you need to specify the logic of upload here : src/features/images/uploadImageAction.tsx
     * You can use Vercel Blob Storage : https://vercel.com/docs/storage/vercel-blob
     * Or you can use Cloudflare R2 : https://mlv.sh/cloudflare-r2-tutorial
     * Or you can use AWS S3 : https://mlv.sh/aws-s3-tutorial
     */
    enableImageUpload: false as boolean,
    /**
     * If enable, you need to go to src/lib/auth/auth.ts and uncomment the line with the emoji 🔑
     * This feature will authorize users to login with a password.
     * Customize the signup form here : app/auth/signup/page.tsx
     */
    enablePasswordAuth: true as boolean,
    /**
     * If enable, the user will be redirected to `/orgs` when he visits the landing page at `/`
     * The logic is located in middleware.ts
     */
    enableLandingRedirection: false as boolean,
    /**
     * If enable, the user will be able to create only ONE organization and all his settings will be synced with it.
     * It's disable the `/settings` page from the organization and the `/orgs/new` page.
     */
    enableSingleMemberOrg: false as boolean,
  },
};