"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { intentionalityClass } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type Status = Awaited<ReturnType<typeof intentionalityClass.getDriveStatus>>;

/** Connects the Google Drive that Intentionality Class registrations are filed to. */
export default function ClassDrivePanel() {
  const { success, error } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await intentionalityClass.getDriveStatus());
    } catch {
      error("Failed to load Google Drive status");
    }
  }, [error]);

  useEffect(() => {
    void load();
    // Google sends the admin back here with ?drive=connected.
    const result = new URLSearchParams(window.location.search).get("drive");
    if (result) {
      if (result === "connected") success("Google Drive connected.");
      else error("Could not connect Google Drive. Please try again.");
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setBusy(true);
    try {
      const { url } = await intentionalityClass.connectDrive();
      window.location.href = url;
    } catch (err) {
      error(err instanceof Error ? err.message : "Could not start the connection");
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await intentionalityClass.disconnectDrive();
      success("Google Drive disconnected. Your existing files stay in your Drive.");
      await load();
    } catch {
      error("Could not disconnect");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-8 space-y-3 rounded-[8px] border border-gray-border bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-slate">Google Drive</h2>
      {!status ? (
        <p className="font-body text-sm text-gray-text">Loading...</p>
      ) : status.connected ? (
        <>
          <p className="font-body text-sm text-gray-text">
            Registrations are saved to the Drive of <strong>{status.googleEmail}</strong>, with a folder and Sheet
            for each phase.
          </p>
          <div className="flex flex-wrap gap-3 font-body text-sm">
            <a href={status.folderUrl} target="_blank" rel="noopener noreferrer" className="text-purple underline">
              Open folder
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="min-w-0 px-4 py-2 text-xs" disabled={busy} onClick={connect}>
              Reconnect
            </Button>
            <Button variant="secondary" className="min-w-0 px-4 py-2 text-xs" disabled={busy} onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="font-body text-sm text-gray-text">
            Connect your Google account and we will create an &quot;Intentionality Class Registrations&quot; folder in
            your Drive, with its own Sheet for each phase. Each new registration is added to its phase&apos;s Sheet. We
            can only see files we create, never the rest of your Drive.
          </p>
          <Button variant="primary" className="min-w-0 px-4 py-2 text-xs" disabled={busy} onClick={connect}>
            Connect Google Drive
          </Button>
        </>
      )}
    </section>
  );
}
