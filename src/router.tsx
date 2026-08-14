import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

import { ApiKeysPage } from "./routes/ApiKeysPage";
import { ExplorePage } from "./routes/ExplorePage";
import { HomePage } from "./routes/HomePage";
import { NotFoundPage } from "./routes/NotFoundPage";
import { NotificationsPage } from "./routes/NotificationsPage";
import { PostDetailPage } from "./routes/PostDetailPage";
import { ProfilePage } from "./routes/ProfilePage";
import { PublishPage } from "./routes/PublishPage";
import { RouteError } from "./routes/RouteError";
import { UserProfilePage } from "./routes/UserProfilePage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: RouteError,
  notFoundComponent: NotFoundPage,
});

// Tabs: routes wrapped by the AppShell (with bottom nav)
const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_shell",
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/",
  component: HomePage,
});

const exploreRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/explore",
  component: ExplorePage,
});

const publishRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/publish",
  component: PublishPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const meRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/me",
  component: ProfilePage,
});

const apiKeysRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/settings/api-keys",
  component: ApiKeysPage,
});

// Standalone (no bottom nav)
const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  component: () => {
    const { userId } = userProfileRoute.useParams();
    return <UserProfilePage userId={userId} />;
  },
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts/$postId",
  component: () => {
    const { postId } = postDetailRoute.useParams();
    return <PostDetailPage postId={postId} />;
  },
});

const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    indexRoute,
    exploreRoute,
    publishRoute,
    notificationsRoute,
    meRoute,
    apiKeysRoute,
  ]),
  userProfileRoute,
  postDetailRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
