"use client";

import { Hero } from "@/features/landing/Hero";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { SectionDivider } from "@/features/landing/SectionDivider";
import { PainSection } from "@/features/landing/Pain";
import { ReviewTriple } from "@/features/landing/review/ReviewTriple";
import { ReviewGrid } from "@/features/landing/review/ReviewGrid";
import { FaqSection } from "@/features/landing/FAQSection";
import { Footer } from "@/features/layout/Footer";
import { BentoSection } from "@/features/landing/BentoSection";
import { PricingSection } from "@/features/plans/PricingSection";
// import { BentoGridSection } from "@/features/landing/BentoSection";
import { WidgetShowcase } from "@/features/landing/WidgetShowcase";
// import { LogoCarousel } from "@/features/landing/LogoCarousel";

export default function LandingPage() {
  return (
    <div className="relative flex h-fit flex-col bg-background text-foreground">
      <div className="mt-16"></div>

      <LandingHeader />

      {/* 1. Hero with communities banner */}
      <Hero />
      {/* <LogoCarousel /> */}

      {/* <SectionDivider /> */}

      {/* 2. Pain section */}
      <PainSection />

      <SectionDivider />

      {/* 3. How it works */}
      <WidgetShowcase />

      <BentoSection />

      <SectionDivider />

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
      <PricingSection />

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
            question: "What is Threader?",
            answer:
              "Threader is a social platform designed for organizations to communicate and share content internally while maintaining a social network feel. It combines the best of enterprise communication tools with modern social media features.",
          },
          {
            question: "How does pricing work?",
            answer:
              "We offer flexible pricing plans based on your organization's needs. Our basic plan is free and includes essential features. Premium plans unlock additional capabilities like increased member limits and enhanced organization features.",
          },
          {
            question: "Can I try before committing?",
            answer:
              "Yes! You can start with our free plan to explore the platform's features. When you're ready to scale, upgrading to a premium plan is seamless and can be done at any time.",
          },
          {
            question: "How secure is my data?",
            answer:
              "Security is our top priority. We implement industry-standard encryption, regular security audits, and strict access controls to ensure your organization's data remains protected.",
          },
          {
            question: "What kind of support do you offer?",
            answer:
              "We provide comprehensive support including documentation, email support, and priority assistance for premium plans. Our team is committed to helping you make the most of Threader.",
          },
        ]}
      />

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
