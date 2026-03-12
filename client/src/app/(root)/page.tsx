"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/Footer";
import { LazySection } from "@/components/ui/LazySection";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

const HeroSection = dynamic(
  () => import("@/components/home/HeroSection").then(m => m.HeroSection),
  { loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 animate-pulse">
      <div className="h-14 w-lg max-w-full rounded-xl bg-white/5" />
      <div className="h-5 w-md max-w-full rounded-lg bg-white/4" />
      <div className="flex gap-4 mt-6">
        <div className="h-12 w-40 rounded-xl bg-indigo-500/20" />
        <div className="h-12 w-36 rounded-xl bg-white/5" />
      </div>
    </div>
  )}
);

const ProblemSolutionSection = dynamic(
  () => import("@/components/home/ProblemSolutionSection").then(m => m.ProblemSolutionSection),
  { loading: () => <SectionSkeleton /> }
);
const ExamEngineSection = dynamic(
  () => import("@/components/home/ExamEngineSection").then(m => m.ExamEngineSection),
  { loading: () => <SectionSkeleton /> }
);
const AnalyticsSection = dynamic(
  () => import("@/components/home/AnalyticsSection").then(m => m.AnalyticsSection),
  { loading: () => <SectionSkeleton /> }
);
const WeakTopicSection = dynamic(
  () => import("@/components/home/WeakTopicSection").then(m => m.WeakTopicSection),
  { loading: () => <SectionSkeleton /> }
);
const CodingPrepSection = dynamic(
  () => import("@/components/home/CodingPrepSection").then(m => m.CodingPrepSection),
  { loading: () => <SectionSkeleton /> }
);
const MultiExamSection = dynamic(
  () => import("@/components/home/MultiExamSection").then(m => m.MultiExamSection),
  { loading: () => <SectionSkeleton /> }
);
const HowItWorksSection = dynamic(
  () => import("@/components/home/HowItWorksSection").then(m => m.HowItWorksSection),
  { loading: () => <SectionSkeleton /> }
);
const AdminSection = dynamic(
  () => import("@/components/home/AdminSection").then(m => m.AdminSection),
  { loading: () => <SectionSkeleton /> }
);
const FinalCTASection = dynamic(
  () => import("@/components/home/FinalCTASection").then(m => m.FinalCTASection),
  { loading: () => <SectionSkeleton /> }
);

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050511] min-h-screen text-white overflow-hidden selection:bg-brand-primary/30 relative">
        <HeroSection />
        <LazySection minHeight="100vh">
          <ProblemSolutionSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <ExamEngineSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <AnalyticsSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <WeakTopicSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <CodingPrepSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <MultiExamSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <HowItWorksSection />
        </LazySection>
        <LazySection minHeight="100vh">
          <AdminSection />
        </LazySection>
        <LazySection minHeight="60vh">
          <FinalCTASection />
        </LazySection>
        <Footer />
      </main>
    </>
  );
}
