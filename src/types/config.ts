export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "";

export interface PlanFeature {
  name: string;
}

export interface Plan {
  priceId: string;
  name: string;
  description: string;
  price: number;
  features: PlanFeature[];
  isFeatured?: boolean;
  isOneTime?: boolean;
}

export interface StripeConfig {
  plans: Plan[];
}

export interface ConfigProps {
  // Core Configuration
  title: string;
  description: string;
  prodUrl: string;
  domain: string;
  appIcon: string;
  appName: string;

  // Company Information
  company: {
    name: string;
    address: string;
  };

  // Branding
  brand: {
    primary: string;
  };

  // Email Configuration
  email: {
    from: string;
    contact: string;
  };

  // Maker Information
  maker: {
    image: string;
    website: string;
    twitter: string;
    name: string;
  };

  // Feature Configuration
  features: {
    enableImageUpload: boolean;
    enablePasswordAuth: boolean;
  };

  // Stripe Configuration
  stripe: StripeConfig;

  // AWS Configuration
  aws: {
    bucket: string;
    bucketUrl: string;
    cdn: string;
  };

  // Auth Configuration
  auth: {
    loginUrl: string;
    callbackUrl: string;
    loginLinkSecret: string;
  };

  // Analytics Configuration
  analytics: {
    vercelAnalytics: {
      projectId: string;
    };
  };

  // Email Configuration
  mailgun: {
    subdomain: string;
    fromNoReply: string;
    fromAdmin: string;
    fromSupport: string;
    supportEmail: string;
    forwardRepliesTo: string;
    replyToEmail: string;
  };

  // Crisp Configuration
  crisp: {
    id: string;
    onlyShowOnRoutes: string[];
  };
}
