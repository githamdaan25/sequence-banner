/**
 * config.js
 * -------------------------------------------------------------
 * Central configuration for the scrub-driven image sequence.
 * Edit these values to point at a different frame set, change
 * frame count, or tune scrub behavior.
 * -------------------------------------------------------------
 */

const SEQUENCE_CONFIG = {
  // Path template for frames. {n} is replaced with a zero-padded index.
  framePathTemplate: "assets/frames/frame_{n}.jpg",

  // Total number of frames in the sequence (source video converted at 30fps).
  totalFrames: 300,

  // Zero-padding width used in filenames (frame_0000.jpg -> 4).
  padLength: 4,

  // First frame index (sequence starts at 0).
  startIndex: 0,

  // Native resolution of the source frames (portrait video).
  frameWidth: 720,
  frameHeight: 1280,

  // Smoothing factor for input-to-frame interpolation (0-1).
  // Lower = smoother/laggier, higher = snappier/more literal.
  scrubSmoothing: 0.12,

  // How many pixels of wheel/touch movement it takes to scrub through
  // the entire sequence start-to-end. Lower = more sensitive.
  scrubDistancePx: 4000,
  scrubSensitivity: 2.5,
  momentumFriction: 0.92,
  // Pixel ratio cap (avoids excessive canvas backing-store size on
  // very high density displays, which would hurt draw performance).
  maxDevicePixelRatio: 2,
};
