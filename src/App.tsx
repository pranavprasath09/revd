import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/ui/LoadingState";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CarsPage = lazy(() => import("@/pages/CarsPage"));
const CarDetailPage = lazy(() => import("@/pages/CarDetailPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const ArticlePage = lazy(() => import("@/pages/ArticlePage"));
const ModsPage = lazy(() => import("@/pages/ModsPage"));
const ReliabilityIndexPage = lazy(() => import("@/pages/ReliabilityIndexPage"));
const ReliabilityPage = lazy(() => import("@/pages/ReliabilityPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main content area — offset for sidebar */}
      <div className="flex min-h-screen flex-1 flex-col pt-14 md:pt-0 md:pl-16 lg:pl-[240px]">
        <main className="flex-1">
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/cars/:make/:model/:year" element={<CarDetailPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<ArticlePage />} />
              <Route path="/mods/:make/:model" element={<ModsPage />} />
              <Route path="/reliability" element={<ReliabilityIndexPage />} />
              <Route path="/reliability/:make/:model" element={<ReliabilityPage />} />
              <Route path="/compare" element={<ComparePage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
