import { Typography } from "@/components/data-display/typography";
import { Layout, LayoutContent } from "@/features/core/page/layout";
import { SiteConfig } from "@/site-config";
import Link from "next/link";
import { Twitter, Mail, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border border-border bg-card">
      <Layout className="py-24">
        <LayoutContent className="flex justify-between max-lg:flex-col">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <Typography variant="h3">{SiteConfig.title}</Typography>
              <Typography variant="muted">{SiteConfig.company.name}</Typography>
              <Typography variant="muted">
                {SiteConfig.company.address}
              </Typography>
            </div>
            <Typography variant="muted" className="italic">
              © {new Date().getFullYear()} {SiteConfig.company.name} - All
              rights reserved.
            </Typography>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Typography variant="large">Legal</Typography>
            <Typography
              as={Link}
              variant="muted"
              className="hover:underline"
              href="/legal/terms"
            >
              Terms
            </Typography>
            <Typography
              as={Link}
              variant="muted"
              className="hover:underline"
              href="/legal/privacy"
            >
              Privacy
            </Typography>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Typography variant="large">Resources</Typography>
            <div className="flex items-center gap-3">
              <Link 
                href={SiteConfig.maker.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors text-muted-foreground hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </Link>
              <Link 
                href={`mailto:${SiteConfig.email.contact}`} 
                className="transition-colors text-muted-foreground hover:text-primary"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="size-4 text-red-500 fill-red-500" />
              <span>from Quebec</span>
            </div>
          </div>
        </LayoutContent>
      </Layout>
    </footer>
  );
};
