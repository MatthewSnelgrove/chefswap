import "../styles/globals.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { QueryClientProvider, QueryClient } from "react-query";
import Navbar from "../components/Navbar";

export default function App({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Component {...pageProps} />
        <ToastContainer autoClose={2000} />
      </QueryClientProvider>
    </>
  );
}
