"use client";

import { useEffect, useState } from "react";
import { Radio, ToggleLeft, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { livestream } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

function AdminLiveStreamContent() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [nextService, setNextService] = useState("");
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await livestream.getConfig();
        setConfig(data);
        setIsLive(data?.isLive || false);
        setEmbedUrl(data?.embedUrl || "");
        setNextService(data?.nextService || "");
      } catch (err) {
        error("Failed to load livestream config");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [error]);

  const handleToggleLive = async () => {
    const newLiveState = !isLive;
    setSaving(true);
    try {
      await livestream.updateLivestream({
        isLive: newLiveState,
        ...(embedUrl ? { embedUrl } : {}),
        ...(nextService ? { nextService } : {}),
      });
      setIsLive(newLiveState);
      success(isLive ? "Livestream turned off" : "Livestream turned on");
    } catch (err) {
      error("Failed to toggle livestream");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    if (isLive && !embedUrl.trim()) {
      error("Please enter an embed URL when livestream is active");
      return;
    }

    setSaving(true);
    try {
      await livestream.updateLivestream({
        isLive,
        embedUrl: embedUrl || undefined,
        nextService: nextService || undefined,
      });
      success("Livestream configuration updated");
    } catch (err) {
      error("Failed to update configuration");
      console.error(err);
    } finally {
      setSaving(false);
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

      {/* Status Card */}
      <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isLive ? "bg-error/10" : "bg-off-white"}`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? "bg-error" : "bg-gray-text"}`} />
              <p className={`font-heading text-sm font-semibold ${isLive ? "text-error" : "text-gray-text"}`}>
                {isLive ? "LIVE" : "OFFLINE"}
              </p>
            </div>
            <h2 className="font-heading text-lg font-bold text-slate">Service Status</h2>
          </div>
          <Button
            variant={isLive ? "secondary" : "primary"}
            className="text-sm py-2 px-6"
            onClick={handleToggleLive}
            disabled={saving}
          >
            <Radio size={16} className="mr-2" />
            {isLive ? "Go Offline" : "Go Live"}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-6">
        {/* Embed URL */}
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-slate mb-4">Embed URL</h3>
          <div>
            <label className="block text-sm font-heading font-semibold text-slate mb-2">Stream Embed URL</label>
            <input
              type="url"
              className="w-full rounded-[4px] border border-gray-border bg-white px-3 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:ring-2 focus:ring-purple-vivid/15 focus:outline-none"
              placeholder="https://... (YouTube, Vimeo, or custom embed URL)"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
            <p className="text-[11px] text-gray-text mt-2">
              Enter the embed URL for your livestream. This will be displayed to users watching the service.
            </p>
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
        {embedUrl && (
          <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-slate mb-4">Preview</h3>
            <div className="aspect-video rounded-[8px] overflow-hidden border border-gray-border bg-black">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Livestream Preview"
              />
            </div>
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
            <p className="font-body text-sm text-error">Livestream is currently active</p>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="mt-8 rounded-[8px] border border-info/30 bg-info/10 p-4">
        <p className="font-heading text-sm font-semibold text-info mb-2">How to use Livestream</p>
        <ul className="text-sm text-info font-body space-y-1">
          <li>1. Prepare your livestream on YouTube, Vimeo, or other platform</li>
          <li>2. Get the embed URL from your livestream platform</li>
          <li>3. Paste the URL in the Embed URL field</li>
          <li>4. Click "Go Live" to activate the livestream</li>
          <li>5. Members will see the stream on the home page</li>
        </ul>
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
