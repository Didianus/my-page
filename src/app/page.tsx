import { Navbar } from "@/components/portfolio/navbar";
import { SocialRail } from "@/components/portfolio/social-rail";
import { Hero } from "@/components/portfolio/hero";
import { Marquee } from "@/components/portfolio/marquee";
import { About } from "@/components/portfolio/about";
import { Expertise } from "@/components/portfolio/expertise";
import { Works } from "@/components/portfolio/works";
import { Process } from "@/components/portfolio/process";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import { AdminPanel } from "@/components/portfolio/admin-panel";
import { SectionDivider } from "@/components/portfolio/section-divider";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <SocialRail />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <About />
        <SectionDivider />
        <Expertise />
        <SectionDivider />
        <Works />
        <SectionDivider />
        <Process />
        <SectionDivider />
        <Contact />
      </main>
      <Footer />
      <AdminPanel />
    </div>
  );
}
