"use client";

import { Typography } from "@/components/data-display/typography";
import { Layout, LayoutContent } from "@/features/core/page/layout";
import { SiteConfig } from "@/site-config";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <Layout className="py-12">
      <LayoutContent className="max-w-3xl mx-auto">
        <div className="space-y-4">
          <Typography variant="h1">Privacy Policy</Typography>
          <Typography variant="muted">Last updated: {new Date().toLocaleDateString()}</Typography>
          <Separator className="my-4" />
          
          <section className="space-y-4">
            <Typography variant="h2">1. Introduction</Typography>
            <Typography>
              At NowNowNow, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
            </Typography>
            <Typography>
              Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">2. Information We Collect</Typography>
            <Typography variant="h3">2.1 Information You Provide</Typography>
            <Typography>
              We collect information you provide directly to us, including:
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Typography>
                  Account information (name, email address, password)
                </Typography>
              </li>
              <li>
                <Typography>
                  Profile information (profile picture, bio)
                </Typography>
              </li>
              <li>
                <Typography>
                  Content you post or share through our services
                </Typography>
              </li>
              <li>
                <Typography>
                  Communications with us or other users
                </Typography>
              </li>
              <li>
                <Typography>
                  Payment information (processed by our payment providers)
                </Typography>
              </li>
            </ul>

            <Typography variant="h3">2.2 Information We Collect Automatically</Typography>
            <Typography>
              When you use our services, we automatically collect certain information, including:
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Typography>
                  Device information (IP address, browser type, operating system)
                </Typography>
              </li>
              <li>
                <Typography>
                  Usage information (pages visited, time spent, actions taken)
                </Typography>
              </li>
              <li>
                <Typography>
                  Cookies and similar technologies
                </Typography>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">3. How We Use Your Information</Typography>
            <Typography>
              We use the information we collect to:
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Typography>
                  Provide, maintain, and improve our services
                </Typography>
              </li>
              <li>
                <Typography>
                  Process transactions and send related information
                </Typography>
              </li>
              <li>
                <Typography>
                  Send administrative messages, updates, and security alerts
                </Typography>
              </li>
              <li>
                <Typography>
                  Respond to your comments, questions, and requests
                </Typography>
              </li>
              <li>
                <Typography>
                  Monitor and analyze trends, usage, and activities
                </Typography>
              </li>
              <li>
                <Typography>
                  Detect, prevent, and address technical issues
                </Typography>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">4. Information Sharing</Typography>
            <Typography>
              We may share your information in the following circumstances:
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Typography>
                  With service providers who perform services on our behalf
                </Typography>
              </li>
              <li>
                <Typography>
                  To comply with legal obligations
                </Typography>
              </li>
              <li>
                <Typography>
                  To protect our rights, privacy, safety, or property
                </Typography>
              </li>
              <li>
                <Typography>
                  In connection with a merger, acquisition, or sale of assets
                </Typography>
              </li>
              <li>
                <Typography>
                  With your consent or at your direction
                </Typography>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">5. Data Security</Typography>
            <Typography>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">6. Your Rights</Typography>
            <Typography>
              Depending on your location, you may have certain rights regarding your personal data, including:
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Typography>
                  Access to your personal data
                </Typography>
              </li>
              <li>
                <Typography>
                  Correction of inaccurate or incomplete data
                </Typography>
              </li>
              <li>
                <Typography>
                  Deletion of your personal data
                </Typography>
              </li>
              <li>
                <Typography>
                  Restriction of processing of your personal data
                </Typography>
              </li>
              <li>
                <Typography>
                  Data portability
                </Typography>
              </li>
              <li>
                <Typography>
                  Objection to processing of your personal data
                </Typography>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">7. Cookies</Typography>
            <Typography>
              We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our services. This helps us provide you with a good experience when you browse our services and allows us to improve our services.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">8. Children's Privacy</Typography>
            <Typography>
              Our services are not intended for children under the age of 13, and we do not knowingly collect personal data from children under 13. If we learn that we have collected personal data from a child under 13, we will take steps to delete that information.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">9. Changes to This Privacy Policy</Typography>
            <Typography>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you through our services or by other means. Your continued use of our services after the changes take effect constitutes your acceptance of the modified Privacy Policy.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">10. Contact Us</Typography>
            <Typography>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <Link href={`mailto:${SiteConfig.email.contact}`} className="text-primary hover:underline">
                {SiteConfig.email.contact}
              </Link>.
            </Typography>
          </section>
        </div>
      </LayoutContent>
    </Layout>
  );
}
