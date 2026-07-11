"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { getQueryClient } from "@/lib/query/client";
import { makeStore } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  const queryClient = getQueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}
