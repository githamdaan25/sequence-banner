/**
 * scrubController.js
 * -------------------------------------------------------------
 * Lets the user "scroll" through the frame sequence using their
 * mouse wheel / trackpad / touch swipe, WITHOUT the page itself
 * ever scrolling — the viewport stays completely still.
 *
 * Two things make this feel fluid rather than mechanical:
 *  1. SENSITIVITY MULTIPLIER — each unit of input moves the target
 *     frame further than a 1:1 mapping would, so small scroll
 *     gestures cover noticeably more of the sequence.
 *  2. MOMENTUM — every input adds to a velocity value that keeps
 *     nudging the target frame forward even after input stops,
 *     decaying smoothly (like inertial scrolling), then a lerp
 *     eases the displayed frame toward that target every tick.
 * -------------------------------------------------------------
 */

class ScrubController {
  constructor(renderer, el) {
    this.renderer = renderer;
    this.el = el;

    this.totalFrames = SEQUENCE_CONFIG.totalFrames;

    this.targetFrame = 0;
    this.displayFrame = 0;
    this.velocity = 0;

    this.pixelsForFullSequence = SEQUENCE_CONFIG.scrubDistancePx || 4000;
    this.sensitivity = SEQUENCE_CONFIG.scrubSensitivity || 2.5;
    this.momentumFriction = SEQUENCE_CONFIG.momentumFriction || 0.92;
    this._velocityFloor = 0.01;

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
    this.el.addEventListener("wheel", this._onWheel, { passive: false });
    this.el.addEventListener("touchstart", this._onTouchStart, { passive: false });
    this.el.addEventListener("touchmove", this._onTouchMove, { passive: false });
  }

  _onWheel(e) {
    e.preventDefault();
    this._addVelocityFromPixels(e.deltaY);
  }

  _onTouchStart(e) {
    this._lastTouchY = e.touches[0].clientY;
    this.velocity = 0;
  }

  _onTouchMove(e) {
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    if (this._lastTouchY !== null) {
      const deltaY = this._lastTouchY - currentY;
      this._addVelocityFromPixels(deltaY);
    }
    this._lastTouchY = currentY;
  }

  _addVelocityFromPixels(deltaPx) {
    const framesPerPixel = (this.totalFrames - 1) / this.pixelsForFullSequence;
    this.velocity += deltaPx * framesPerPixel * this.sensitivity;
  }

  _startRenderLoop() {
    this._rafId = requestAnimationFrame(this._tick);
  }

  _tick() {
    if (Math.abs(this.velocity) > this._velocityFloor) {
      this.targetFrame += this.velocity;
      this.velocity *= this.momentumFriction;
    } else {
      this.velocity = 0;
    }

    this.targetFrame = Math.max(0, Math.min(this.totalFrames - 1, this.targetFrame));

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
