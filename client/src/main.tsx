import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ThemeProvider>
);
