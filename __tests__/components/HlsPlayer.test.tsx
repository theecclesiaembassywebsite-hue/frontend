import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

type Handler = (event: string, data: { fatal: boolean }) => void;

// jsdom has no media pipeline, so hls.js is replaced by a double that records
// what the component asks of it and lets a test fire a fatal error.
const hlsState = vi.hoisted(() => ({
  instances: [] as Array<{
    loadSource: ReturnType<typeof vi.fn>;
    attachMedia: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    emit: (event: string, data: { fatal: boolean }) => void;
  }>,
  supported: true,
}));

vi.mock("hls.js", () => {
  class FakeHls {
    static Events = { ERROR: "hlsError", MANIFEST_PARSED: "hlsManifestParsed" };
    static isSupported() {
      return hlsState.supported;
    }
    private handlers = new Map<string, Handler>();
    loadSource = vi.fn();
    attachMedia = vi.fn();
    destroy = vi.fn();
    config: unknown;
    constructor(config: unknown) {
      this.config = config;
      hlsState.instances.push({
        loadSource: this.loadSource,
        attachMedia: this.attachMedia,
        destroy: this.destroy,
        emit: (event, data) => this.handlers.get(event)?.(event, data),
      });
    }
    on(event: string, handler: Handler) {
      this.handlers.set(event, handler);
    }
  }
  return { default: FakeHls };
});

import HlsPlayer from "@/components/live/HlsPlayer";

const SRC = "https://tv.example.org/ecclesia-tv.m3u8";

describe("HlsPlayer", () => {
  beforeEach(() => {
    hlsState.instances.length = 0;
    hlsState.supported = true;
    // jsdom: no native HLS, and play() is not implemented.
    HTMLMediaElement.prototype.canPlayType = vi.fn().mockReturnValue("");
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.load = vi.fn();
  });

  it("loads the playlist through hls.js without a worker (the CSP blocks blob workers)", async () => {
    render(<HlsPlayer src={SRC} />);

    await waitFor(() => expect(hlsState.instances).toHaveLength(1));
    const [hls] = hlsState.instances;
    expect(hls.loadSource).toHaveBeenCalledWith(SRC);
    expect(hls.attachMedia).toHaveBeenCalledTimes(1);
  });

  it("shows an unavailable message with a retry when hls.js reports a fatal error", async () => {
    render(<HlsPlayer src={SRC} title="Ecclesia TV" />);
    await waitFor(() => expect(hlsState.instances).toHaveLength(1));

    hlsState.instances[0].emit("hlsError", { fatal: true });

    expect(
      await screen.findByText(/Ecclesia TV is unavailable right now/i)
    ).toBeInTheDocument();
  });

  it("ignores non-fatal errors", async () => {
    render(<HlsPlayer src={SRC} />);
    await waitFor(() => expect(hlsState.instances).toHaveLength(1));

    hlsState.instances[0].emit("hlsError", { fatal: false });

    expect(screen.queryByText(/unavailable right now/i)).not.toBeInTheDocument();
  });

  it("reloads the stream on retry and releases the failed instance", async () => {
    render(<HlsPlayer src={SRC} />);
    await waitFor(() => expect(hlsState.instances).toHaveLength(1));
    hlsState.instances[0].emit("hlsError", { fatal: true });

    fireEvent.click(await screen.findByRole("button", { name: /try again/i }));

    await waitFor(() => expect(hlsState.instances).toHaveLength(2));
    expect(hlsState.instances[0].destroy).toHaveBeenCalled();
    expect(hlsState.instances[1].loadSource).toHaveBeenCalledWith(SRC);
  });

  it("reports unavailable when the browser cannot play HLS at all", async () => {
    hlsState.supported = false;
    render(<HlsPlayer src={SRC} />);

    expect(await screen.findByText(/unavailable right now/i)).toBeInTheDocument();
  });

  it("uses the browser's native HLS when it has it (Safari)", async () => {
    HTMLMediaElement.prototype.canPlayType = vi
      .fn()
      .mockReturnValue("maybe");
    const { container } = render(<HlsPlayer src={SRC} />);

    await waitFor(() =>
      expect(container.querySelector("video")?.getAttribute("src")).toBe(SRC)
    );
    expect(hlsState.instances).toHaveLength(0);
  });

  it("destroys the hls.js instance on unmount", async () => {
    const { unmount } = render(<HlsPlayer src={SRC} />);
    await waitFor(() => expect(hlsState.instances).toHaveLength(1));

    unmount();

    expect(hlsState.instances[0].destroy).toHaveBeenCalled();
  });
});
