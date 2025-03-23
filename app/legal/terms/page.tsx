"use client";

import { Typography } from "@/components/data-display/typography";
import { Layout, LayoutContent } from "@/features/core/page/layout";
import { SiteConfig } from "@/site-config";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function TermsPage() {
  return (
    <Layout className="py-12">
      <LayoutContent className="max-w-3xl mx-auto">
        <div className="space-y-4">
          <Typography variant="h1">Terms of Service</Typography>
          <Typography variant="muted">Last updated: {new Date().toLocaleDateString()}</Typography>
          <Separator className="my-4" />
          
          <section className="space-y-4">
            <Typography variant="h2">1. Introduction</Typography>
            <Typography>
              Welcome to NowNowNow ("we," "our," or "us"). By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully.
            </Typography>
            <Typography>
              These Terms of Service ("Terms") govern your access to and use of our website, applications, and services (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">2. Using Our Services</Typography>
            <Typography variant="h3">2.1 Account Creation</Typography>
            <Typography>
              To use certain features of the Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </Typography>
            <Typography variant="h3">2.2 User Content</Typography>
            <Typography>
              You retain ownership of any content you submit, post, or display on or through the Services ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in any existing or future media.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">3. Subscription and Billing</Typography>
            <Typography>
              Some of our Services require payment. By subscribing to a paid plan, you agree to pay the fees as described at the time of purchase. We may change our fees at any time, but changes will not apply retroactively.
            </Typography>
            <Typography>
              Unless otherwise stated, subscriptions automatically renew at the end of each billing period. You can cancel your subscription at any time through your account settings or by contacting us.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">4. Prohibited Conduct</Typography>
            <Typography>
              You agree not to:
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Typography>
                  Use the Services in any way that violates any applicable law or regulation
                </Typography>
              </li>
              <li>
                <Typography>
                  Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity
                </Typography>
              </li>
              <li>
                <Typography>
                  Engage in any activity that interferes with or disrupts the Services
                </Typography>
              </li>
              <li>
                <Typography>
                  Attempt to gain unauthorized access to the Services or related systems
                </Typography>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">5. Termination</Typography>
            <Typography>
              We may terminate or suspend your access to the Services at any time, with or without cause, and with or without notice. Upon termination, your right to use the Services will immediately cease.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">6. Disclaimer of Warranties</Typography>
            <Typography>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">7. Limitation of Liability</Typography>
            <Typography>
              IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE SERVICES.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">8. Changes to Terms</Typography>
            <Typography>
              We may modify these Terms at any time. If we make material changes, we will notify you through the Services or by other means. Your continued use of the Services after the changes take effect constitutes your acceptance of the modified Terms.
            </Typography>
          </section>

          <section className="space-y-4">
            <Typography variant="h2">9. Contact Us</Typography>
            <Typography>
              If you have any questions about these Terms, please contact us at{" "}
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
