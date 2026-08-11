import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/mutator";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.msg : "请求失败");
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});
