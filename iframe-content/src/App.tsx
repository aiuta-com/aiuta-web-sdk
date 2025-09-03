import React, { useEffect } from "react";
import { Route, Routes, MemoryRouter } from "react-router-dom";

// reudx
import { useAppDispatch } from "@lib/redux/store";

// actions
import { configSlice } from "@lib/redux/slices/configSlice";

// pages
import Qr from "./pages/Qr";
import Home from "./pages/Home";
import View from "./pages/View";
import History from "./pages/History";
import Generated from "./pages/Generated";
import QRTokenPage from "./pages/Qr/token";
import Previously from "./pages/Previously";
import UploadImages from "./pages/UploadImages";

// components
import { SdkHeader } from "./components/shared";
import { SdkFooter } from "./components/shared";
import { FullScreenImageModal } from "./components/feature";
import { Spinner } from "./components/feature/spinner/spinner";

function App() {
  const dispatch = useAppDispatch();

  const initialPath = window.location.hash.replace(/^#/, "") || "/";

  const handleGetStylesConfiguration = () => {
    window.parent.postMessage(
      { action: "GET_AIUTA_STYLES_CONFIGURATION" },
      "*"
    );
  };

  const loadCustomCSS = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cssUrl = urlParams.get('css');
    
    if (cssUrl) {
      // Resolve relative URLs relative to parent page's origin
      let resolvedCssUrl = cssUrl;
      
      if (!cssUrl.startsWith('http')) {
        try {
          // Get parent page's origin
          const parentOrigin = window.parent.location.origin;
          resolvedCssUrl = new URL(cssUrl, parentOrigin).href;
        } catch (error) {
          // Fallback: try to construct the URL manually
          console.warn('Could not resolve relative URL, trying fallback');
          const parentOrigin = window.parent.location.origin;
          resolvedCssUrl = cssUrl.startsWith('/') 
            ? `${parentOrigin}${cssUrl}`
            : `${parentOrigin}/${cssUrl}`;
        }
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = resolvedCssUrl;
      link.onload = () => console.log('Custom CSS loaded from:', resolvedCssUrl);
      link.onerror = () => console.error('Failed to load custom CSS from:', resolvedCssUrl);
      document.head.appendChild(link);
    }
  };

  useEffect(() => {
    handleGetStylesConfiguration();

    loadCustomCSS();

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type &&
        event.data.type === "stylesConfiguration"
      ) {
        dispatch(
          configSlice.actions.setStylesConfiguration(
            event.data.stylesConfiguration.stylesConfiguration
          )
        );
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Spinner />
      <SdkHeader />
      <FullScreenImageModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generated" element={<Generated />} />
        <Route path="/history" element={<History />} />
        <Route path="/previously" element={<Previously />} />
        <Route path="/qr" element={<Qr />} />
        <Route path="/uploadImages" element={<UploadImages />} />
        <Route path="/view" element={<View />} />
        <Route path="/qr/:token" element={<QRTokenPage />} />
      </Routes>
      <SdkFooter />
    </MemoryRouter>
  );
}

export default App;
