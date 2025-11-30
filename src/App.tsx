
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home from "./pages/Home.jsx";
import BrowseChallenges from "./pages/BrowseChallenges.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseChallenges />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
