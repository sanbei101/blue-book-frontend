import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

import { HomePage } from "./routes/HomePage";
import { ExplorePage } from "./routes/ExplorePage";
import { PublishPage } from "./routes/PublishPage";
import { NotificationsPage } from "./routes/NotificationsPage";
import { ProfilePage } from "./routes/ProfilePage";
import { UserProfilePage } from "./routes/UserProfilePage";
import { PostDetailPage } from "./routes/PostDetailPage";
import { NotFoundPage } from "./routes/NotFoundPage";
import { RouteError } from "./routes/RouteError";

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
