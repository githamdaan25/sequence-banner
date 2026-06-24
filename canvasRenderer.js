/**
 * canvasRenderer.js
 * -------------------------------------------------------------
 * Wraps the <canvas> element: handles resizing (including Retina
 * pixel ratio), and draws a given frame image with "object-fit: cover"
 * style scaling so the sequence always fills the viewport without
 * distortion.
 * -------------------------------------------------------------
 */

class CanvasRenderer {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.cssWidth = 0;
    this.cssHeight = 0;
    this.dpr = 1;

    this.currentFrameIndex = -1; // last drawn frame, avoids redundant draws
    this.frames = [];

    this._resizeRAF = null;
    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize, { passive: true });

    this.resize();
  }

  setFrames(frames) {
    this.frames = frames;
  }

  /**
   * Recomputes canvas backing-store size based on current viewport
   * and capped device pixel ratio. Called on init and on resize.
   */
  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
    this.dpr = Math.min(window.devicePixelRatio || 1, SEQUENCE_CONFIG.maxDevicePixelRatio);

    this.canvas.width = Math.round(this.cssWidth * this.dpr);
    this.canvas.height = Math.round(this.cssHeight * this.dpr);
    this.canvas.style.width = `${this.cssWidth}px`;
    this.canvas.style.height = `${this.cssHeight}px`;

    // Scale drawing context so 1 unit = 1 CSS pixel, while the
    // backing store stays at full device resolution (crisp on Retina).
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Force a redraw at the new size with whatever frame is current.
    if (this.currentFrameIndex >= 0 && this.frames[this.currentFrameIndex]) {
      this._draw(this.frames[this.currentFrameIndex]);
    }
  }

  _onResize() {
    // Debounce via rAF so rapid resize events don't thrash layout/draw.
    if (this._resizeRAF) cancelAnimationFrame(this._resizeRAF);
    this._resizeRAF = requestAnimationFrame(() => this.resize());
  }

  /**
   * Draws an image fit to the canvas HEIGHT (edge-to-edge top/bottom),
   * preserving aspect ratio, centered horizontally. If the resulting
   * width is narrower than the canvas, the remaining space on the
   * left/right is left as black background (letterboxed sides).
   */
  _draw(img) {
    const ctx = this.ctx;
    const cw = this.cssWidth;
    const ch = this.cssHeight;

    if (!img || !img.naturalWidth) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const imageRatio = iw / ih;

    // Always match the canvas height exactly, scale width to match
    // the source aspect ratio, then center horizontally.
    const drawHeight = ch;
    const drawWidth = ch * imageRatio;
    const offsetX = (cw - drawWidth) / 2;
    const offsetY = 0;

    // Paint black first so any uncovered left/right strip reads as
    // intentional letterboxing rather than a transparent/empty canvas.
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  /**
   * Renders the given frame index if it differs from the last drawn
   * frame (prevents redundant draw calls / flicker when index is
   * unchanged between rAF ticks).
   */
  renderFrame(index) {
    const clamped = Math.max(0, Math.min(this.frames.length - 1, Math.round(index)));
    if (clamped === this.currentFrameIndex) return;

    const img = this.frames[clamped];
    if (!img) return;

    this._draw(img);
    this.currentFrameIndex = clamped;
  }

  destroy() {
    window.removeEventListener("resize", this._onResize);
  }
}
