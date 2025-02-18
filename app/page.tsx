import { Pricing } from "@/features/billing/plans/pricing-section";
import { EmailFormSection } from "@/features/communication/email/email-form-section";
import { Footer } from "@/features/core/footer";
import { BentoGridSection } from "@/features/marketing/bento-section";
import { CTASectionCard } from "@/features/marketing/cta/cta-card-section";
import { CTAImageSection } from "@/features/marketing/cta/cta-image-section";
import { CtaSection } from "@/features/marketing/cta/cta-section";
import { FAQSection } from "@/features/marketing/faq-section";
import { FeaturesSection } from "@/features/marketing/feature-section";
import { Hero } from "@/features/marketing/hero";
import { LandingHeader } from "@/features/marketing/landing-header";
import { PainSection } from "@/features/marketing/pain";
import { ReviewGrid } from "@/features/marketing/review/review-grid";
import { ReviewSingle } from "@/features/marketing/review/review-single";
import { ReviewTriple } from "@/features/marketing/review/review-triple";
import { StatsSection } from "@/features/marketing/stats-section";
import Image from "next/image";

import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await baseAuth();
  const user = session?.user;

  if (user) {
    const userOrg = await prisma.organizationMembership.findFirst({
      where: { userId: user.id },
      include: {
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (userOrg) {
      redirect(`/orgs/${userOrg.organization.slug}`);
    }

    redirect("/orgs/new");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <Hero />

        <StatsSection />

        <BentoGridSection />

        <PainSection />

        <FeaturesSection
          features={[
            {
              badge: "⏰ Schedule",
              title: "Schedule your post",
              description:
                "Schedule your post on the Threader in a few clicks.",
              component: (
                <Image
                  src="/images/placeholder1.gif"
                  alt=""
                  width={200}
                  height={100}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              ),
            },
            {
              badge: "📅 Calendar",
              title: "See what you scheduled",
              description:
                "With the calendar view, you can see what you scheduled and when.",
              component: (
                <Image
                  src="/images/placeholder1.gif"
                  alt=""
                  width={200}
                  height={100}
                  className="h-auto w-full object-cover"
                />
              ),
            },
          ]}
        />

        <ReviewSingle
          image="https://i.pravatar.cc/300?u=5"
          name="Michel"
          review="Threader has completely transformed the way I manage my social media content."
          role="Digital Marketer"
        />

        <ReviewTriple
          reviews={[
            {
              image: "https://i.pravatar.cc/300?u=a1",
              name: "Sophie",
              review:
                "Threader has completely transformed the way I manage my social media content.",
              role: "Digital Marketer",
            },
            {
              image: "https://i.pravatar.cc/300?u=a2",
              name: "Alex",
              review:
                "Using Threader has significantly boosted my online engagement.",
              role: "Social Media Influencer",
            },
            {
              image: "https://i.pravatar.cc/300?u=a3",
              name: "Jordan",
              review:
                "The ease of scheduling and the AI-generated content features are game-changers.",
              role: "Entrepreneur",
            },
          ]}
        />

        <ReviewGrid
          reviews={[
            {
              image: "https://i.pravatar.cc/300?u=b1",
              name: "Eva",
              review:
                "Since I started using Threader, my content creation process has been streamlined.",
              role: "Content Creator",
            },
            {
              image: "https://i.pravatar.cc/300?u=b2",
              name: "Lucas",
              review: "Threader's scheduling feature is a lifesaver.",
              role: "Social Media Manager",
            },
          ]}
        />

        <CTAImageSection />

        <CTASectionCard />

        <CtaSection />

        <Pricing />

        <FAQSection
          faq={[
            {
              question: "What is Threader?",
              answer:
                "Threader is an innovative platform designed to help you write, schedule, and publish content.",
            },
            {
              question: "How does AI Content Generation work?",
              answer:
                "Our AI Content Generation feature leverages the power of artificial intelligence to create unique and engaging content.",
            },
          ]}
        />

        <EmailFormSection />
      </main>

      <Footer />
    </div>
  );
}
