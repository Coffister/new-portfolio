import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import Navbar from "./features/navigation/Navbar";
import Hero from "./features/hero/Hero";
import ProjectsSection from "./features/projects/ProjectsSection";
import Cursor from "@/ui/components/Cursor/Cursor";
import Process from "./features/process/ProcessSection";
import Estimate from "./features/estimate";
import About from "./features/about";
import Faq from "./features/faq";
import Footer from "./features/footer";
import { CursorProvider } from "@/providers/CursorProvider";
import { PrivacyModalProvider } from "@/providers/PrivacyModalProvider";
import { initializeScrollSystem, destroyScrollSystem } from "@/lib/scroll";

function App() {
  useEffect(() => {
    initializeScrollSystem();

    return () => {
      destroyScrollSystem();
    };
  }, []);

  return (
    <CursorProvider>
      <PrivacyModalProvider>
        <MainLayout>
          <Cursor />
            <Navbar />
            <Hero />
            <ProjectsSection />
            <Process />
            <Estimate />
            <About />
            <Faq />
          <Footer />
        </MainLayout>
      </PrivacyModalProvider>
    </CursorProvider>
  );
}

export default App;