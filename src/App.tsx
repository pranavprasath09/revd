import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import LoadingState from "@/components/ui/LoadingState";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CarsPage = lazy(() => import("@/pages/CarsPage"));
const CarDetailPage = lazy(() => import("@/pages/CarDetailPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const ArticlePage = lazy(() => import("@/pages/ArticlePage"));
const ModsIndexPage = lazy(() => import("@/pages/ModsIndexPage"));
const ModsPage = lazy(() => import("@/pages/ModsPage"));
const ReliabilityIndexPage = lazy(() => import("@/pages/ReliabilityIndexPage"));
const ReliabilityPage = lazy(() => import("@/pages/ReliabilityPage"));
const GaragePage = lazy(() => import("@/pages/GaragePage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const SignInPage = lazy(() => import("@/pages/SignInPage"));
const MeetsPage = lazy(() => import("@/pages/MeetsPage"));
const CreateMeetPage = lazy(() => import("@/pages/CreateMeetPage"));
const MeetDetailPage = lazy(() => import("@/pages/MeetDetailPage"));
const CommunitiesPage = lazy(() => import("@/pages/CommunitiesPage"));
const CreateCommunityPage = lazy(() => import("@/pages/CreateCommunityPage"));
const CommunityDetailPage = lazy(() => import("@/pages/CommunityDetailPage"));
const PostDetailPage = lazy(() => import("@/pages/PostDetailPage"));
const CreatePostPage = lazy(() => import("@/pages/CreatePostPage"));
const BuildsPage = lazy(() => import("@/pages/BuildsPage"));
const CreateBuildPage = lazy(() => import("@/pages/CreateBuildPage"));
const BuildDetailPage = lazy(() => import("@/pages/BuildDetailPage"));
const AddBuildEntryPage = lazy(() => import("@/pages/AddBuildEntryPage"));
const PhotosPage = lazy(() => import("@/pages/PhotosPage"));
const CreateAlbumPage = lazy(() => import("@/pages/CreateAlbumPage"));
const AlbumDetailPage = lazy(() => import("@/pages/AlbumDetailPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

export default function App() {
  return (
    <AuthProvider>
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
                <Route path="/mods" element={<ModsIndexPage />} />
                <Route path="/mods/:make/:model" element={<ModsPage />} />
                <Route path="/reliability" element={<ReliabilityIndexPage />} />
                <Route path="/reliability/:make/:model" element={<ReliabilityPage />} />
                <Route path="/garage" element={<GaragePage />} />
                <Route path="/meets" element={<MeetsPage />} />
                <Route path="/meets/create" element={<CreateMeetPage />} />
                <Route path="/meets/:id" element={<MeetDetailPage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/communities/create" element={<CreateCommunityPage />} />
                <Route path="/communities/:slug" element={<CommunityDetailPage />} />
                <Route path="/communities/:slug/post/:postId" element={<PostDetailPage />} />
                <Route path="/communities/:slug/create" element={<CreatePostPage />} />
                <Route path="/builds" element={<BuildsPage />} />
                <Route path="/builds/create" element={<CreateBuildPage />} />
                <Route path="/builds/:id" element={<BuildDetailPage />} />
                <Route path="/builds/:id/add-entry" element={<AddBuildEntryPage />} />
                <Route path="/photos" element={<PhotosPage />} />
                <Route path="/photos/create" element={<CreateAlbumPage />} />
                <Route path="/photos/:id" element={<AlbumDetailPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/sign-in" element={<SignInPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
}
