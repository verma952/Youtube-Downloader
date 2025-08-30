import React, { useState } from "react";
import axios from "axios";
import "./DownloadForm.css"; // Your CSS file

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function YouTubeDownloader() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchFormats = async (e) => {
    e.preventDefault();
    setError("");
    setVideoInfo(null);

    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/video/download`, { url });
      if (res.data.success) {
        setVideoInfo(res.data);
      } else {
        setError(res.data.error || "An unknown error occurred.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch formats. Please check the server and URL.");
    } finally {
      setIsLoading(false);
    }
  };

  // This function triggers the download by pointing the browser to the backend stream URL
  const handleDownload = (videoFormatId) => {
  // 1. Find the best audio format from the state
  // Since we sorted the list, the first one is the best quality
  const bestAudioFormat = videoInfo.audioFormats[0];

  // 2. Check if an audio format exists
  if (!bestAudioFormat) {
    setError("No audio formats were found to merge with the video.");
    return;
  }

  // 3. Construct the new URL with the correct parameter names
  const downloadUrl = `${API_BASE_URL}/api/video/stream?url=${encodeURIComponent(url)}&videoItag=${videoFormatId}&audioItag=${bestAudioFormat.id}`;
  
  // 4. Trigger the download
  window.open(downloadUrl, '_blank');
};
  return (
    <div className="yd-container">
      <h1 className="yd-title">YouTube Downloader</h1>
      <h3 className="yd-subtitle">Download YouTube Videos and Audios Here. Just paste your link...</h3>
      <form className="yd-form" onSubmit={fetchFormats}>
        <input
          className="yd-input"
          type="text"
          placeholder="Paste YouTube link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
        <button className="yd-button" type="submit" disabled={!url.trim() || isLoading}>
          {isLoading ? "Fetching..." : "Fetch"}
        </button>
      </form>

      {error && <div className="yd-error">{error}</div>}

      {videoInfo && (
        <div>
          <h2 className="yd-video-title">{videoInfo.title}</h2>
          
          {videoInfo.videoFormats?.length > 0 && (
            <div className="yd-section">
              <h3>Video Formats (MP4)</h3>
              <ul className="yd-list">
                {videoInfo.videoFormats.sort((a,b) => (b.size || 0) - (a.size || 0)).map((f) => (
                  <li key={f.id} className="yd-list-item">
                    <div className="yd-format-info">
                      <strong>{f.quality}</strong>
                      {f.size && <span> - {(f.size / 1024 / 1024).toFixed(2)} MB</span>}
                    </div>
                    <button className="yd-download-btn" onClick={() => handleDownload(f.id)}>
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {videoInfo.audioFormats?.length > 0 && (
            <div className="yd-section">
              <h3>Audio Only</h3>
              <ul className="yd-list">
                {videoInfo.audioFormats.sort((a,b) => (b.size || 0) - (a.size || 0)).map((f) => (
                  <li key={f.id} className="yd-list-item">
                    <div className="yd-format-info">
                      <strong>{f.bitrate}kbps ({f.ext})</strong>
                      {f.size && <span> - {(f.size / 1024 / 1024).toFixed(2)} MB</span>}
                    </div>
                    <button className="yd-download-btn" onClick={() => handleDownload(f.id)}>
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}