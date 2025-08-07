import { Spinner } from "@/components/feature/spinner/spinner";
import { SdkFooter, SdkHeader } from "@/components/shared";
import "@/styles/globals.css";
import { store } from "@lib/redux/store";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { FullScreenImageModal } from "@/components/feature";
// import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  // const router = useRouter();

  return (
    <Provider store={store}>
      <SdkHeader />
      <main>
        <Spinner />
        <FullScreenImageModal />
        <AnimatePresence mode="wait" initial={false}>
          <Component {...pageProps} />
        </AnimatePresence>
      </main>
      <SdkFooter />
    </Provider>
  );
}
