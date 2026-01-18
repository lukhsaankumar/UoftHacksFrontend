import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import './index.css';

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { HomePage } from "./components/HomePage";
import { ProductList } from "./components/ProductList";
import { ProductAiPage } from "./components/ProductAiPage";
import { SuggestionsPage } from "./components/SuggestionsPage";
import { ShopifyAppBridgeProvider } from "./components/AppBridgeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider i18n={{}}>
      <ShopifyAppBridgeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app" element={<HomePage />} />
            <Route path="/app/products" element={<ProductList />} />
            <Route path="/app/products/:id" element={<ProductAiPage />} />
            <Route path="/app/suggestions" element={<SuggestionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ShopifyAppBridgeProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
