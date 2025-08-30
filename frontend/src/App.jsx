import { HelmetProvider, Helmet } from "react-helmet-async";
import DownloadForm from "./components/DownloadForm";
import "./App.css";
function App() {
  return (
    <HelmetProvider>
    <div className = "app">
      <Helmet>
        <title>YouTube Video Downloader | Fast & Free</title>
        <meta name="description" content="Download YouTube videos quickly and easily with our free web app." />
        <meta name="keywords" content="YouTube downloader, download videos, MERN stack project" />
      </Helmet>
      <DownloadForm />
    </div>
    </HelmetProvider>
  );
}

export default App;
