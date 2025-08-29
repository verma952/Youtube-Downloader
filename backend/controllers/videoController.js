import ytdl from "@distube/ytdl-core";
import ffmpeg from 'ffmpeg-static';
import { spawn } from "child_process";

// Sanitize filenames to prevent errors (no changes here)
const sanitizeFilename = (name) => {
  return name.replace(/[^\x00-\x7F]/g, "").replace(/[<>:"/\\|?*]/g, '_');
};

// getFormats function remains the same (no changes here)
export const getFormats = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ success: false, error: "Invalid YouTube URL provided." });
    }

    const info = await ytdl.getInfo(url);

    const uniqueVideoFormats = new Map();
    ytdl.filterFormats(info.formats, 'videoonly').forEach(format => {
      if (format.qualityLabel) {
        const existing = uniqueVideoFormats.get(format.qualityLabel);
        if (!existing || format.container === 'mp4') {
          uniqueVideoFormats.set(format.qualityLabel, {
            id: format.itag,
            quality: format.qualityLabel,
            ext: format.container,
            size: format.contentLength ? parseInt(format.contentLength, 10) : null,
            mimeType: format.mimeType,
          });
        }
      }
    });

    const uniqueAudioFormats = new Map();
    ytdl.filterFormats(info.formats, 'audioonly').forEach(format => {
      if (format.audioBitrate) {
        const existing = uniqueAudioFormats.get(format.audioBitrate);
        if (!existing || format.container === 'mp4') {
          uniqueAudioFormats.set(format.audioBitrate, {
            id: format.itag,
            bitrate: format.audioBitrate,
            ext: format.container,
            size: format.contentLength ? parseInt(format.contentLength, 10) : null,
            mimeType: format.mimeType,
          });
        }
      }
    });
    
    res.status(200).json({
      success: true,
      title: info.videoDetails.title,
      videoFormats: Array.from(uniqueVideoFormats.values()),
      audioFormats: Array.from(uniqueAudioFormats.values()),
    });

  } catch (err) {
    console.error("Error in getFormats:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch video formats. The video might be private, region-locked, or the URL is incorrect." });
  }
};


// --- COMPLETELY REVISED streamVideo FUNCTION ---
export const streamVideo = async (req, res) => {
  try {
    const { url, videoItag, audioItag } = req.query;

    if (!url || !videoItag || !audioItag || !ytdl.validateURL(url)) {
      return res.status(400).send("Invalid request: URL, videoItag, and audioItag are required.");
    }

    const info = await ytdl.getInfo(url);
    
      // --- START OF NEW CODE ---
    
    // 1. Find the format objects to get their content length
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: videoItag });
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: audioItag });

    if (!videoFormat || !audioFormat) {
      return res.status(404).send("Could not find requested video or audio formats.");
    }

    // 2. Estimate the total size by adding the two stream lengths
    const totalLength = (parseInt(videoFormat.contentLength) || 0) + (parseInt(audioFormat.contentLength) || 0);
    
    // --- END OF NEW CODE ---
    // Set response headers for the download
    const title = sanitizeFilename(info.videoDetails.title);
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Get the video and audio streams from ytdl
    const videoStream = ytdl(url, { quality: videoItag });
    const audioStream = ytdl(url, { quality: audioItag });

    // Define FFmpeg arguments for merging
   const ffmpegArgs = [
  '-loglevel', 'error', '-hide_banner',
  '-i', 'pipe:3', 
  '-i', 'pipe:4',
  '-map', '0:v', 
  '-map', '1:a',
  '-c:v', 'copy', 
  '-c:a', 'copy',
  '-f', 'mp4',
  // THIS IS THE FIX: Instructs FFmpeg to create a streamable MP4 format
  '-movflags', 'frag_keyframe+empty_moov', 
  'pipe:1'
];

    // Spawn an FFmpeg process
    const ffmpegProcess = spawn(ffmpeg, ffmpegArgs, {
      stdio: [ 'pipe', 'pipe', 'pipe', 'pipe', 'pipe' ],
    });

    // Pipe streams into the FFmpeg process
    videoStream.pipe(ffmpegProcess.stdio[3]);
    audioStream.pipe(ffmpegProcess.stdio[4]);

    // Pipe FFmpeg's output (the merged video) to the client's response
    ffmpegProcess.stdout.pipe(res);

    // --- Error and Cleanup Handling ---
    ffmpegProcess.stderr.on('data', (data) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

    // When the client closes the connection, kill the FFmpeg process
    res.on('close', () => {
        ffmpegProcess.kill();
        videoStream.destroy();
        audioStream.destroy();
    });

  } catch (err) {
    console.error("Error in streamVideo:", err);
    res.status(500).send("Failed to process and stream video.");
  }
};