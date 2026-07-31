import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import PitWallShell from "@/components/pitwall/PitWallShell";
import Masthead from "@/components/margin/Masthead";
import LoadingState from "@/components/ui/LoadingState";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

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
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const MeetsPage = lazy(() => import("@/pages/MeetsPage"));
const CreateMeetPage = lazy(() => import("@/pages/CreateMeetPage"));
const MeetDetailPage = lazy(() => import("@/pages/MeetDetailPage"));
const CommunitiesPage = lazy(() => import("@/pages/CommunitiesPage"));
const CreateCommunityPage = lazy(() => import("@/pages/CreateCommunityPage"));
const CommunityDetailPage = lazy(() => import("@/pages/CommunityDetailPage"));
const PostDetailPage = lazy(() => import("@/pages/PostDetailPage"));
const CreatePostPage = lazy(() => import("@/pages/CreatePostPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const BuildsPage = lazy(() => import("@/pages/BuildsPage"));
const CreateBuildPage = lazy(() => import("@/pages/CreateBuildPage"));
const BuildDetailPage = lazy(() => import("@/pages/BuildDetailPage"));
const AddBuildEntryPage = lazy(() => import("@/pages/AddBuildEntryPage"));
const PremiumPage = lazy(() => import("@/pages/PremiumPage"));
const PhotosPage = lazy(() => import("@/pages/PhotosPage"));
const CreateAlbumPage = lazy(() => import("@/pages/CreateAlbumPage"));
const AlbumDetailPage = lazy(() => import("@/pages/AlbumDetailPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

/**
 * Format assignment (ROUTES.md): Margin for everything browsed, read, or
 * shared outside the app; Pit Wall for everything else. Forms are always
 * Pit Wall, so the /create routes stay out of the Margin set.
 */
function isMarginRoute(pathname: string): boolean {
  if (pathname.startsWith("/news")) return true;
  if (pathname === "/sign-in") return true;
  if (pathname.startsWith("/profile/")) return true;
  if (pathname.startsWith("/communities")) {
    return !pathname.endsWith("/create");
  }
  if (pathname.startsWith("/photos")) {
    return pathname !== "/photos/create";
  }
  if (pathname.startsWith("/meets")) {
    return pathname !== "/meets/create";
  }
  return false;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
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
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/photos/create" element={<CreateAlbumPage />} />
          <Route path="/photos/:id" element={<AlbumDetailPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const location = useLocation();
  const margin = isMarginRoute(location.pathname);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationsProvider>
          {margin ? (
            <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
              <Masthead />
              <main className="flex-1">
                <AppRoutes />
              </main>
            </div>
          ) : (
            <PitWallShell>
              <AppRoutes />
            </PitWallShell>
          )}
        </NotificationsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
