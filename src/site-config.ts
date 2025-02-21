export const SiteConfig = {
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