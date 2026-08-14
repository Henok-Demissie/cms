import { Header } from "@/components/marketing/header"
import { HeroSection } from "@/components/marketing/hero-section"
import { ServicesSection } from "@/components/marketing/services-section"
import { FeaturesSection } from "@/components/marketing/features-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { TestimonialsSection } from "@/components/marketing/testimonials-section"
import { BlogSection } from "@/components/marketing/blog-section"
import { FAQSection } from "@/components/marketing/faq-section"
import { CTASection } from "@/components/marketing/cta-section"
import { AboutSection } from "@/components/marketing/about-section"
import { FeedbackSection } from "@/components/marketing/feedback-section"
import { SuggestionsSection } from "@/components/marketing/suggestions-section"
import { Footer } from "@/components/marketing/footer"

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <FeaturesSection />
      <CTASection />
      <PricingSection />
      <TestimonialsSection />
      <BlogSection />
      <FeedbackSection />
      <SuggestionsSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
