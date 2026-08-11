import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query-client";

import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    <Toaster position="top-center" richColors closeButton />
  </StrictMode>,
);
