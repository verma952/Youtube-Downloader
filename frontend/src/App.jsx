import { HelmetProvider, Helmet } from "react-helmet-async";
import DownloadForm from "./components/DownloadForm";
import Footer from "./pages/Footer";
import "./App.css";

function App() {
  return (
    <HelmetProvider>
      <div className="app">
        <Helmet>
          {/* Basic SEO */}
          <html lang="en" />
          <title>YouTube Video Downloader | Fast & Free</title>
          <meta
            name="description"
            content="Download YouTube videos quickly and easily in HD MP4 or MP3 formats with our free web app."
          />
          <meta
            name="keywords"
            content="YouTube downloader, free YouTube video download, MP4, MP3, online video downloader"
          />

          {/* Open Graph (Facebook, WhatsApp) */}
          <meta property="og:title" content="Free YouTube Video Downloader" />
          <meta
            property="og:description"
            content="Fast, free, and secure YouTube video downloader. Convert videos to MP4 & MP3 instantly."
          />
          <meta property="og:image" content="/thumbnail.png" />
          <meta property="og:url" content="https://yourdomain.com" />
          <meta property="og:type" content="website" />

          {/* Twitter Cards */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="YouTube Video Downloader | Fast & Free" />
          <meta
            name="twitter:description"
            content="Download YouTube videos quickly in HD MP4 or MP3 format. Free and easy to use."
          />
          <meta name="twitter:image" content="/thumbnail.png" />
        </Helmet>

        {/* Main Content */}
        <h1>Free YouTube Video Downloader</h1>
        <p>Download YouTube videos in HD MP4 or MP3 formats instantly with our fast, secure, and free downloader.</p>

        <DownloadForm />
        <Footer />
      </div>
    </HelmetProvider>
  );
}

export default App;
