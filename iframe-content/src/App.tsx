import React from "react";
import {
  Route,
  Routes,
  MemoryRouter,
  HashRouter as Router,
} from "react-router-dom";
import Home from "./pages/Home";
import Generated from "./pages/Generated";
import History from "./pages/History";
import Previously from "./pages/Previously";
import Qr from "./pages/Qr";
import UploadImages from "./pages/UploadImages";
import View from "./pages/View";
import QRTokenPage from "./pages/Qr/token";
import { SdkHeader } from "./components/shared";
import { SdkFooter } from "./components/shared";

function App() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Router>
        <SdkHeader />
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
      </Router>
    </MemoryRouter>
  );
}

export default App;
