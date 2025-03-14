"use client";

import { Hero } from "@/features/landing/Hero";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { SectionDivider } from "@/features/landing/SectionDivider";
import { PainSection } from "@/features/landing/Pain";
import { ReviewTriple } from "@/features/landing/review/ReviewTriple";
import { ReviewGrid } from "@/features/landing/review/ReviewGrid";
import { FaqSection } from "@/features/landing/FAQSection";
import { Footer } from "@/features/layout/footer";
import { BentoSection } from "@/features/landing/BentoSection";
import { ClientPricingSection } from "@/features/billing/plans/pricing-section";
import { WidgetShowcase } from "@/features/landing/WidgetShowcase";
import { Suspense } from "react";

export default function LandingPage() {
  return (
    <div className="relative flex h-fit flex-col bg-background text-foreground">
      <div className="mt-16"></div>

      <LandingHeader />

      {/* 1. Hero with communities banner */}
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      }>
        <Hero />
      </Suspense>
      {/* <LogoCarousel /> */}

      {/* <SectionDivider /> */}

      {/* 2. Pain section */}
      <PainSection />

      <SectionDivider />
      <BentoSection />

      {/* 3. How it works */}
      <WidgetShowcase />

      {/* 4. Benefits */}
      {/* <BentoGridSection /> */}

      <SectionDivider />

      {/* 5. First testimonials */}
      <ReviewTriple
        reviews={[
          {
            image: "https://i.pravatar.cc/300?u=a1",
            name: "Sophie",
            review: `Threader **has completely transformed the way I manage my social media** content. The ability to schedule posts and use AI for content suggestions has saved me hours each week.`,
            role: "Digital Marketer",
          },
          {
            image: "https://i.pravatar.cc/300?u=a2",
            name: "Alex",
            review: `Using Threader has significantly boosted my online engagement. **The analytics tool helps me understand what works**, allowing me to refine my strategy and grow my follower base.`,
            role: "Social Media Influencer",
          },
          {
            image: "https://i.pravatar.cc/300?u=a3",
            name: "Jordan",
            review: `The ease of scheduling and the AI-generated content features are game-changers. **Threader's user-friendly interface** makes it perfect for anyone looking to enhance their online presence.`,
            role: "Entrepreneur",
          },
        ]}
      />

      <SectionDivider />

      {/* 6. Pricing */}
      <section className="py-24">
        <ClientPricingSection variant="default" />
      </section>

      <SectionDivider />

      {/* 7. More testimonials */}
      <ReviewGrid
        reviews={[
          {
            image: "https://i.pravatar.cc/300?u=b1",
            name: "Eva",
            review:
              "Since I started using Threader, my content creation process has been streamlined. The AI suggestions are spot on, helping me to connect better with my audience. Highly recommend for anyone looking to elevate their content game.",
            role: "Content Creator",
          },
          {
            image: "https://i.pravatar.cc/300?u=b2",
            name: "Lucas",
            review:
              "Threader's scheduling feature is a lifesaver. It allows me to plan my content calendar efficiently, ensuring I never miss posting on the optimal days and times. Fantastic tool for social media managers.",
            role: "Social Media Manager",
          },
          {
            image: "https://i.pravatar.cc/300?u=b3",
            name: "Mia",
            review:
              "The analytics provided by Threader are invaluable. They've given me insights into what my audience loves, helping me double my engagement rate in just a few months.",
            role: "Digital Marketer",
          },
          {
            image: "https://i.pravatar.cc/300?u=b4",
            name: "Noah",
            review:
              "I was skeptical about AI-generated content, but Threader changed my mind. The content feels personal and has significantly increased my interaction rates.",
            role: "Content Creator",
          },
        ]}
      />

      <SectionDivider />

      {/* 8. FAQ */}
      <FaqSection
        faq={[
          {
            question: "What is NowNowNow?",
            answer:
              "NowNowNow is a modern social media platform designed for organizations to share content and engage with their audience. It combines the best aspects of social networking with powerful organization-centric features, making it perfect for businesses, communities, and content creators.",
          },
          {
            question: "How does NowNowNow differ from other social platforms?",
            answer:
              "Unlike traditional social media, NowNowNow is built around organizations first. This means better content organization, more control over your audience engagement, and powerful tools specifically designed for professional content sharing. Plus, our unique widget system lets you embed your content anywhere on the web.",
          },
          {
            question: "What types of organizations can use NowNowNow?",
            answer:
              "NowNowNow is perfect for any organization that wants to share content and engage with their audience. This includes businesses, educational institutions, content creators, community groups, and more. Our flexible platform adapts to your organization's specific needs.",
          },
          {
            question: "How does the widget integration work?",
            answer:
              "Our widget system is simple yet powerful. Just copy your unique widget code and paste it into your website. The widget automatically updates with your latest content, maintaining your brand's visual identity while providing a seamless experience for your audience.",
          },
          {
            question: "What features are included in the free plan?",
            answer:
              "The free plan includes essential features like basic content sharing, organization profile, and widget integration. For advanced features like custom branding, analytics, and team collaboration, check out our Pro plans.",
          },
          {
            question: "Can I upgrade or downgrade my plan at any time?",
            answer:
              "Yes! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, you'll retain access to your current features until the end of your billing period.",
          },
          {
            question: "How secure is my organization's data?",
            answer:
              "Security is our top priority. We use industry-standard encryption, regular security audits, and strict access controls to protect your data. Your content is always under your control, and we never share your organization's data with third parties.",
          },
          {
            question: "Do you offer customer support?",
            answer:
              "Yes! All plans include access to our comprehensive documentation and community support. Pro plan subscribers also get priority email support and dedicated account management for enterprise customers.",
          },
        ]}
      />

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
