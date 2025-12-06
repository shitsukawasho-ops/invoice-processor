import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/lp/Header";
import { Hero } from "@/components/lp/Hero";
import { PainPoints } from "@/components/lp/PainPoints";
import { WhyUs } from "@/components/lp/WhyUs";
import { ServiceOverview } from "@/components/lp/ServiceOverview";
import { Flow } from "@/components/lp/Flow";
import { CaseStudies } from "@/components/lp/CaseStudies";
import { Pricing } from "@/components/lp/Pricing";
import { FAQ } from "@/components/lp/FAQ";
import { CTA } from "@/components/lp/CTA";
import { Footer } from "@/components/lp/Footer";

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("Error in Home page:", error);
    // Continue to render LP even if auth fails, or handle error appropriately
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <Hero />
      <PainPoints />
      <WhyUs />
      <ServiceOverview />
      <Flow />
      <CaseStudies />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
