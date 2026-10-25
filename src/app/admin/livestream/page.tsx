"use client";

import { useCallback, useEffect, useState } from "react";
import { Radio, Calendar, Wifi, WifiOff, RefreshCw, Tv } from "lucide-react";
import Button from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HlsPlayer from "@/components/live/HlsPlayer";
import RadioPlayer from "@/components/live/RadioPlayer";
import { livestream } from "@/lib/api";
import { normalizeStreamUrl } from "@/lib/streams";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { normalizeEmbedUrl } from "@/lib/utils";

function YouTubeAutoDetect() {
  const [status, setStatus] = useState<{ isLive: boolean; videoId: string | null } | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/youtube-live");
      const data = await res.json();
      setStatus({ isLive: data.isLive ?? false, videoId: data.videoId ?? null });
    } catch {
      setStatus({ isLive: false, videoId: null });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
    const id = window.setInterval(check, 60000);
    return () => window.clearInterval(id);
  }, [check]);

  return (
    <div className="flex items-start gap-4">
      <div className={`mt-0.5 flex-shrink-0 rounded-full p-2 ${status?.isLive ? "bg-error/10" : "bg-off-white"}`}>
        {status?.isLive ? (
          <Wifi size={18} className="text-error" />
        ) : (
          <WifiOff size={18} className="text-gray-text" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {status === null ? (
            <p className="font-body text-sm text-gray-text">Checking YouTube…</p>
          ) : status.isLive ? (
            <>
              <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
              <p className="font-heading text-sm font-semibold text-error">Channel is LIVE — stream is showing on /live automatically</p>
            </>
          ) : (
            <p className="font-heading text-sm font-semibold text-slate">Channel is currently offline</p>
          )}
        </div>
        {status?.isLive && status.videoId && (
          <p className="font-body text-xs text-gray-text">
            Video ID: <code className="bg-off-white px-1 rounded">{status.videoId}</code>
          </p>
        )}
        <p className="font-body text-[11px] text-gray-text mt-1">
          Checks every 60 seconds. When your YouTube channel goes live, the /live page switches automatically — no action needed.
        </p>
      </div>
      <button
        onClick={check}
        disabled={checking}
        className="flex-shrink-0 rounded-[4px] border border-gray-border p-2 hover:bg-off-white disabled:opacity-40 transition-colors"
        title="Refresh now"
      >
        <RefreshCw size={14} className={checking ? "animate-spin text-gray-text" : "text-gray-text"} />
      </button>
    </div>
  );
}

function AdminLiveStreamContent() {
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [nextService, setNextService] = useState("");
  const [tvUrl, setTvUrl] = useState("");
  // The preview follows the field on blur, not on every keystroke: each valid-
  // looking intermediate value would otherwise reload the stream.
  const [tvPreviewUrl, setTvPreviewUrl] = useState("");
  const [radioUrl, setRadioUrl] = useState("");
  const [savingChannels, setSavingChannels] = useState(false);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await livestream.getConfig();
        setIsLive(data?.isLive || false);
        setEmbedUrl(data?.embedUrl || "");
        setNextService(data?.nextService || "");
        setTvUrl(data?.tvUrl || "");
        setTvPreviewUrl(normalizeStreamUrl(data?.tvUrl));
        setRadioUrl(data?.radioUrl || "");
      } catch (err) {
        error("Failed to load livestream config");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [error]);

  const normalizedUrl = normalizeEmbedUrl(embedUrl);

  const handleToggleLive = async () => {
    const newLiveState = !isLive;
    if (newLiveState && !normalizedUrl) {
      error("Please enter a valid stream URL before going live");
      return;
    }
    setSaving(true);
    try {
      await livestream.updateLivestream({
        isLive: newLiveState,
        ...(normalizedUrl ? { embedUrl: normalizedUrl } : {}),
        ...(nextService ? { nextService } : {}),
      });
      setIsLive(newLiveState);
      if (normalizedUrl) setEmbedUrl(normalizedUrl);
      success(isLive ? "Manual fallback disabled" : "Manual fallback enabled");
    } catch (err) {
      error("Failed to toggle livestream");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    if (isLive && !normalizedUrl) {
      error("Please enter a valid stream URL when manual fallback is active");
      return;
    }
    if (embedUrl.trim() && !normalizedUrl) {
      error("Could not recognize that URL. Paste a YouTube/Vimeo link or embed code.");
      return;
    }

    setSaving(true);
    try {
      await livestream.updateLivestream({
        isLive,
        embedUrl: normalizedUrl || undefined,
        nextService: nextService || undefined,
      });
      if (normalizedUrl) setEmbedUrl(normalizedUrl);
      success("Livestream configuration saved");
    } catch (err) {
      error("Failed to update configuration");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Blank is allowed (it switches that channel off); anything else must be a
  // usable https URL, because the public pages and the app ignore the rest.
  const tvValid = normalizeStreamUrl(tvUrl);
  const radioValid = normalizeStreamUrl(radioUrl);
  const tvInvalid = tvUrl.trim() !== "" && !tvValid;
  const radioInvalid = radioUrl.trim() !== "" && !radioValid;

  const handleSaveChannels = async () => {
    if (tvInvalid || radioInvalid) {
      error("Stream links must start with https://");
      return;
    }
    setSavingChannels(true);
    try {
      await livestream.updateChannels({ tvUrl: tvValid, radioUrl: radioValid });
      setTvUrl(tvValid);
      setRadioUrl(radioValid);
      success("Ecclesia TV & Radio saved");
    } catch (err) {
      error("Failed to save Ecclesia TV & Radio");
      console.error(err);
    } finally {
      setSavingChannels(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Livestream Control</h1>
        <Skeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-1">Livestream Control</h1>
      <p className="text-body-small mb-6">Manage live service streaming and configuration</p>

      {/* YouTube Auto-Detection */}
      <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm mb-6">
        <h2 className="font-heading text-base font-bold text-slate mb-4">YouTube Auto-Detection</h2>
        <YouTubeAutoDetect />
      </div>

      {/* Status Card */}
      <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isLive ? "bg-error/10" : "bg-off-white"}`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? "bg-error" : "bg-gray-text"}`} />
              <p className={`font-heading text-sm font-semibold ${isLive ? "text-error" : "text-gray-text"}`}>
                {isLive ? "MANUAL FALLBACK ACTIVE" : "AUTO-DETECT"}
              </p>
            </div>
            <h2 className="font-heading text-lg font-bold text-slate">Public Livestream Mode</h2>
          </div>
          <Button
            variant={isLive ? "secondary" : "primary"}
            className="text-sm py-2 px-6"
            onClick={handleToggleLive}
            disabled={saving}
          >
            <Radio size={16} className="mr-2" />
            {isLive ? "Disable Manual Fallback" : "Enable Manual Fallback"}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-6">
        {/* Embed URL */}
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-slate mb-4">Manual Fallback <span className="text-sm font-body font-normal text-gray-text">(optional)</span></h3>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-2">Paste a specific stream link to use only when the channel is not auto-detected live</label>
            <textarea
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="https://www.youtube.com/watch?v=...  or  youtu.be/...  or  <iframe src='...'></iframe>"
              rows={2}
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
            <p className="text-[11px] text-gray-text mt-2">
              Accepts: YouTube watch URL, youtu.be short link, embed URL, channel live_stream URL, or the full &lt;iframe&gt; embed code from YouTube/Vimeo. We&apos;ll auto-clean it, but the public page will still prefer a confirmed live stream from your official YouTube channel when one exists.
            </p>
            {embedUrl && normalizedUrl && normalizedUrl !== embedUrl && (
              <div className="mt-3 rounded-[4px] bg-success/10 border border-success/30 p-3">
                <p className="text-[11px] font-heading font-semibold text-success mb-1">Cleaned URL (will be saved):</p>
                <p className="font-body text-xs text-slate break-all">{normalizedUrl}</p>
              </div>
            )}
            {embedUrl && !normalizedUrl && (
              <div className="mt-3 rounded-[4px] bg-error/10 border border-error/30 p-3">
                <p className="text-[11px] font-body text-error">Could not recognize this as a stream URL. Paste a YouTube link or embed code.</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Service */}
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-slate mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-info" />
            Next Service
          </h3>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-2">Date & Time</label>
            <input
              type="datetime-local"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-3 font-body text-sm text-slate focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              value={nextService}
              onChange={(e) => setNextService(e.target.value)}
            />
            <p className="text-[11px] text-gray-text mt-2">
              Set the date and time of the next service. Users will see a countdown.
            </p>
          </div>
        </div>

        {/* Preview */}
        {normalizedUrl && (
          <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-slate mb-4">Preview</h3>
            <div className="aspect-video rounded-[8px] overflow-hidden border border-gray-border bg-black">
              <iframe
                src={normalizedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Livestream Preview"
              />
            </div>
            <p className="text-[11px] text-gray-text mt-2">This preview is used when manual fallback is enabled and the YouTube channel is not already auto-detected live.</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex gap-2">
        <Button
          variant="primary"
          className="px-6 py-2.5"
          onClick={handleSaveConfig}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
        {isLive && (
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-error/10 border border-error/30">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <p className="font-body text-sm text-error">Manual fallback is currently active</p>
          </div>
        )}
      </div>

      {/* Ecclesia TV & Radio */}
      <div className="mt-10 rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-slate mb-1 flex items-center gap-2">
          <Tv size={20} className="text-info" />
          Ecclesia TV &amp; Radio
        </h2>
        <p className="text-body-small mb-6">
          Our own 24/7 channels. Once a link is saved, the website and the app show
          the matching Watch / Listen buttons; clear a link to switch that channel off.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="tv-url" className="block text-sm font-heading font-semibold text-slate mb-2">
              Ecclesia TV link (HLS)
            </label>
            <input
              id="tv-url"
              type="url"
              inputMode="url"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="https://tv.theecclesiaembassy.org/ecclesia-tv.m3u8"
              value={tvUrl}
              onChange={(e) => setTvUrl(e.target.value)}
              onBlur={() => setTvPreviewUrl(normalizeStreamUrl(tvUrl))}
              aria-invalid={tvInvalid}
            />
            {tvInvalid && (
              <p className="mt-2 text-[11px] font-body text-error">
                Must be a full https:// link to the .m3u8 playlist.
              </p>
            )}
            {tvPreviewUrl && (
              <div className="mt-3 max-w-xl">
                <p className="text-[11px] text-gray-text mb-2">Preview (plays here, not saved until you press Save):</p>
                <HlsPlayer src={tvPreviewUrl} title="Ecclesia TV preview" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="radio-url" className="block text-sm font-heading font-semibold text-slate mb-2">
              Ecclesia Radio link (audio stream)
            </label>
            <input
              id="radio-url"
              type="url"
              inputMode="url"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="https://radio.theecclesiaembassy.org/listen/ecclesia/radio.mp3"
              value={radioUrl}
              onChange={(e) => setRadioUrl(e.target.value)}
              aria-invalid={radioInvalid}
            />
            {radioInvalid && (
              <p className="mt-2 text-[11px] font-body text-error">
                Must be a full https:// link to the audio stream.
              </p>
            )}
            {radioValid && (
              <div className="mt-3 max-w-xl rounded-[8px] bg-slate p-4">
                <RadioPlayer key={radioValid} src={radioValid} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            className="px-6 py-2.5"
            onClick={handleSaveChannels}
            disabled={savingChannels || tvInvalid || radioInvalid}
          >
            {savingChannels ? "Saving..." : "Save TV & Radio"}
          </Button>
        </div>
      </div>

      {/* Quick Info */}
      <div className="mt-8 rounded-[8px] border border-info/30 bg-info/10 p-4">
        <p className="font-heading text-sm font-semibold text-info mb-2">How the Livestream works</p>
        <ol className="text-sm text-info font-body space-y-1 list-decimal list-inside">
          <li><strong>Automatic:</strong> Just start your YouTube livestream — the /live page detects it within 60 seconds and switches to the stream automatically. No action needed here.</li>
          <li><strong>Manual fallback:</strong> If you need a backup source, paste it in the Manual Fallback box and enable it. The public page still prefers the confirmed official channel stream whenever one exists.</li>
          <li>Set <strong>Next Service</strong> date/time. When not live, /live shows a countdown to that service.</li>
          <li>After the service ends on YouTube, /live reverts to the countdown instead of drifting into unrelated recommended videos.</li>
        </ol>
      </div>
    </div>
  );
}

export default function AdminLiveStreamPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminLiveStreamContent />
    </ProtectedRoute>
  );
}
