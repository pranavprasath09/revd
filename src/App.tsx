import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/ui/LoadingState";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CarsPage = lazy(() => import("@/pages/CarsPage"));
const CarDetailPage = lazy(() => import("@/pages/CarDetailPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const ArticlePage = lazy(() => import("@/pages/ArticlePage"));
const ModsPage = lazy(() => import("@/pages/ModsPage"));
const ReliabilityPage = lazy(() => import("@/pages/ReliabilityPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/cars/:make/:model/:year" element={<CarDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<ArticlePage />} />
            <Route path="/mods/:make/:model" element={<ModsPage />} />
            <Route path="/reliability/:make/:model" element={<ReliabilityPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
