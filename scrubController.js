/**
 * scrubController.js
 * -------------------------------------------------------------
 * Lets the user "scroll" through the frame sequence using their
 * mouse wheel / trackpad / touch swipe, WITHOUT the page itself
 * ever scrolling — the viewport stays completely still. Wheel and
 * touch deltas are captured, scroll/touch-move is prevented, and
 * the accumulated delta drives a target frame index. A lerp then
 * eases the displayed frame toward that target every rAF tick for
 * a smooth, weighted, premium scrub feel (no sudden jumps).
 * -------------------------------------------------------------
 */

class ScrubController {
  /**
   * @param {CanvasRenderer} renderer
   * @param {HTMLElement} el - element to listen for wheel/touch input on
   */
  constructor(renderer, el) {
    this.renderer = renderer;
    this.el = el;

    this.totalFrames = SEQUENCE_CONFIG.totalFrames;

    // targetFrame: where input has scrubbed us to.
    // displayFrame: what's actually rendered, eased toward targetFrame.
    this.targetFrame = 0;
    this.displayFrame = 0;

    // How many pixels of wheel/touch movement it takes to traverse
    // the entire sequence start-to-end. Lower = more sensitive.
    this.pixelsForFullSequence = SEQUENCE_CONFIG.scrubDistancePx || 4000;

    this._onWheel = this._onWheel.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._tick = this._tick.bind(this);

    this._lastTouchY = null;
    this._rafId = null;

    this._bindEvents();
    this._startRenderLoop();
  }

  _bindEvents() {
    // passive: false is required so we can call preventDefault() and
    // stop the page itself from scrolling on wheel input.
    this.el.addEventListener("wheel", this._onWheel, { passive: false });
    this.el.addEventListener("touchstart", this._onTouchStart, { passive: false });
    this.el.addEventListener("touchmove", this._onTouchMove, { passive: false });
  }

  _onWheel(e) {
    e.preventDefault();
    this._advanceByPixels(e.deltaY);
  }

  _onTouchStart(e) {
    this._lastTouchY = e.touches[0].clientY;
  }

  _onTouchMove(e) {
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    if (this._lastTouchY !== null) {
      // Swiping up should advance forward, like scrolling down does.
      const deltaY = this._lastTouchY - currentY;
      this._advanceByPixels(deltaY);
    }
    this._lastTouchY = currentY;
  }

  _advanceByPixels(deltaPx) {
    const framesPerPixel = (this.totalFrames - 1) / this.pixelsForFullSequence;
    this.targetFrame += deltaPx * framesPerPixel;
    this.targetFrame = Math.max(0, Math.min(this.totalFrames - 1, this.targetFrame));
  }

  /**
   * Render loop: each frame, ease displayFrame toward targetFrame and
   * draw it. Keeps running continuously so the easing settles smoothly
   * even after input stops.
   */
  _startRenderLoop() {
    this._rafId = requestAnimationFrame(this._tick);
  }

  _tick() {
    const diff = this.targetFrame - this.displayFrame;

    if (Math.abs(diff) < 0.05) {
      this.displayFrame = this.targetFrame;
    } else {
      this.displayFrame += diff * SEQUENCE_CONFIG.scrubSmoothing;
    }

    this.renderer.renderFrame(this.displayFrame);

    this._rafId = requestAnimationFrame(this._tick);
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.el.removeEventListener("wheel", this._onWheel);
    this.el.removeEventListener("touchstart", this._onTouchStart);
    this.el.removeEventListener("touchmove", this._onTouchMove);
  }
}
