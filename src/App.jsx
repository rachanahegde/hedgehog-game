import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Zap, Trash2, Utensils, Sparkles, Moon, Sun } from 'lucide-react';

// --- Constants & Config ---
const TICK_RATE = 3000;
const ANIMATION_SPEED = 300;
const MAX_STAT = 100;

const COLORS = {
  bg: '#fdf6e3',
  quillDark: '#3e2723',    // Darkest brown for outline/shadow
  quillMid: '#5d4037',     // Mid brown for quill body
  quillLight: '#8d6e63',   // Light brown for quill highlights
  bodyShadow: '#d7ccc8',   // Shadow on body
  body: '#efebe9',         // Main body fur (creamy white)
  face: '#fff3e0',         // Face mask area
  cheek: '#ffccbc',        // Rosy cheek
  eye: '#212121',          // Black eye
  highlight: '#ffffff',    // Eye sparkle
  mouth: '#d84315',        // Mouth
  nose: '#1a120b',         // Dark nose
  ear: '#d7ccc8',          // Ear color
  earInner: '#ffab91',     // Inner ear pink
  paw: '#d7ccc8',          // Paws
};

const A = 'A';
const B = 'B';
const C = 'C';
const D = 'D';
const E = 'E';

// --- REDESIGNED PIXEL ART v10 (Refined Side View 32x24) ---
// Legend:
// 0: Empty
// 1: Quill Dark, 2: Quill Mid, 3: Quill Light
// 4: Body Shadow, 5: Body, 6: Face
// 7: Eye, 8: Highlight, 9: Cheek
// A: Nose, B: Mouth, C: Ear, D: Ear Inner, E: Paw

const IDLE_FRAME_1 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Spikes sticking out
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, C, C, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, D, D, C, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 7, 7, 6, 6, 6, A], // Eye open (7)
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 0],
  [0, 0, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 0, 0], // Rounded belly
  [0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0]  // Distinct feet
];

const IDLE_FRAME_2 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Shift down
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, C, C, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, D, D, C, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 7, 7, 6, 6, 6, A], // Eye open (7) - NO BLINK
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 0],
  [0, 0, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 0, 0],
  [0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0]
];

const SLEEP_FRAME = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Same shape as IDLE 1
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, C, C, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, D, D, C, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, A], // Eye closed (6)
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 0],
  [0, 0, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 0, 0],
  [0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0]
];

const HAPPY_FRAME = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, C, C, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, D, D, C, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 0, 0, 0],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 7, 7, 6, 6, 6, A],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 0],
  [0, 0, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, E, E, E, 0, 0, 0, 0, 0, 0, 0] // Paws up
];

// --- Custom Hooks ---

function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// --- Components ---

const ProgressBar = ({ value, color, icon: Icon, label }) => (
  <div className="flex items-center gap-3 w-full mb-3 group">
    <div className={`p-2 rounded-lg bg-white shadow-sm border border-stone-200 ${value < 30 ? 'animate-pulse text-red-500' : 'text-stone-600'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
        <span className="text-xs font-mono text-stone-400">{Math.round(value)}%</span>
      </div>
      <div className="h-3 bg-stone-200 rounded-full overflow-hidden border border-stone-300 shadow-inner">
        <div
          className={`h-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon: Icon, label, disabled, colorClass }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center justify-center p-3 rounded-xl border-b-4 
      transition-all duration-150 active:border-b-0 active:translate-y-1
      ${disabled ? 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed' : `bg-white border-stone-200 hover:bg-stone-50 text-stone-700 hover:${colorClass} shadow-sm`}
    `}
  >
    <Icon className="mb-1" size={24} />
    <span className="text-xs font-bold font-mono">{label}</span>
  </button>
);

const PixelHedgehog = ({ action, frameTick }) => {
  // Determine pixel map based on action and frame tick
  let pixelMap = IDLE_FRAME_1;

  if (action === 'sleep') {
    pixelMap = SLEEP_FRAME;
  } else if (action === 'eat') {
    pixelMap = frameTick % 2 === 0 ? IDLE_FRAME_1 : IDLE_FRAME_2;
  } else if (action === 'play' || action === 'happy') {
    pixelMap = frameTick % 2 === 0 ? HAPPY_FRAME : IDLE_FRAME_1;
  } else {
    // Idle breathing loop - NO BLINKING
    pixelMap = frameTick % 2 === 0 ? IDLE_FRAME_1 : IDLE_FRAME_2;
  }

  // Render the grid
  const renderPixels = () => {
    const pixels = [];
    pixelMap.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 0) return;

        let fill = 'transparent';
        switch (cell) {
          case 1: fill = COLORS.quillDark; break;
          case 2: fill = COLORS.quillMid; break;
          case 3: fill = COLORS.quillLight; break;
          case 4: fill = COLORS.bodyShadow; break;
          case 5: fill = COLORS.body; break;
          case 6: fill = COLORS.face; break;
          case 7: fill = COLORS.eye; break;
          case 8: fill = COLORS.highlight; break;
          case 9: fill = COLORS.cheek; break;
          case 'A': fill = COLORS.nose; break;
          case 'B': fill = COLORS.mouth; break;
          case 'C': fill = COLORS.ear; break;
          case 'D': fill = COLORS.earInner; break;
          case 'E': fill = COLORS.paw; break;
          default: fill = 'transparent';
        }

        // Add Apple for Eat Action - Adjusted for side view (right side)
        if (action === 'eat' && x === 28 && y === 18) {
          fill = '#ff5252';
        }

        pixels.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1.05} // Slight overlap
            height={1.05}
            fill={fill}
            shapeRendering="crispEdges"
          />
        );
      });
    });
    return pixels;
  };

  return (
    <svg
      viewBox="0 0 32 24"
      className="w-80 h-60 drop-shadow-xl transition-transform duration-300"
      style={{
        transform: action === 'play' ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
        filter: action === 'sleep' ? 'brightness(0.9) contrast(0.9)' : 'none'
      }}
    >
      {renderPixels()}
    </svg>
  );
};

// --- Main App Component ---

export default function App() {
  const [stats, setStats] = useState({
    hunger: 80,
    energy: 80,
    happiness: 80,
    cleanliness: 90
  });

  const [currentAction, setCurrentAction] = useState('idle');
  const [frameTick, setFrameTick] = useState(0);
  const [mood, setMood] = useState('happy');
  const [notifications, setNotifications] = useState([]);

  // Animation Loop
  useInterval(() => {
    setFrameTick(t => t + 1);
  }, ANIMATION_SPEED);

  // Stats Decay Loop
  useInterval(() => {
    if (currentAction === 'sleep') {
      setStats(prev => ({
        ...prev,
        energy: Math.min(prev.energy + 5, MAX_STAT),
        hunger: Math.max(prev.hunger - 2, 0),
        cleanliness: Math.max(prev.cleanliness - 0.5, 0),
      }));
    } else {
      setStats(prev => ({
        hunger: Math.max(prev.hunger - 1, 0),
        energy: Math.max(prev.energy - 0.5, 0),
        happiness: Math.max(prev.happiness - 1, 0),
        cleanliness: Math.max(prev.cleanliness - 0.8, 0),
      }));
    }
  }, TICK_RATE);

  // Monitor Stats
  useEffect(() => {
    const avg = (stats.hunger + stats.energy + stats.happiness + stats.cleanliness) / 4;

    if (avg < 30) setMood('sick');
    else if (avg < 60) setMood('sad');
    else setMood('happy');

    const newNotes = [];
    if (stats.hunger < 20) newNotes.push("I'm hungry!");
    if (stats.energy < 20) newNotes.push("So tired...");
    if (stats.cleanliness < 20) newNotes.push("I need a bath!");

    if (newNotes.length > 0 && notifications.length === 0) {
      setNotifications(newNotes);
      setTimeout(() => setNotifications([]), 3000);
    }
  }, [stats]);

  const handleAction = (actionType) => {
    if (currentAction !== 'idle' && currentAction !== 'sleep') return;
    if (currentAction === 'sleep' && actionType !== 'wake') return;

    let duration = 2000;
    let newStats = { ...stats };

    switch (actionType) {
      case 'feed':
        setCurrentAction('eat');
        newStats.hunger = Math.min(newStats.hunger + 30, MAX_STAT);
        newStats.happiness = Math.min(newStats.happiness + 10, MAX_STAT);
        break;
      case 'play':
        if (stats.energy < 10) {
          setNotifications(["Too tired to play!"]);
          return;
        }
        setCurrentAction('play');
        newStats.happiness = Math.min(newStats.happiness + 30, MAX_STAT);
        newStats.energy = Math.max(newStats.energy - 20, 0);
        break;
      case 'clean':
        setCurrentAction('clean');
        newStats.cleanliness = 100;
        newStats.happiness = Math.min(newStats.happiness + 5, MAX_STAT);
        break;
      case 'sleep':
        setCurrentAction('sleep');
        duration = 0;
        break;
      case 'wake':
        setCurrentAction('idle');
        duration = 0;
        break;
      default:
        break;
    }

    setStats(newStats);

    if (duration > 0) {
      setTimeout(() => {
        setCurrentAction('idle');
      }, duration);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-stone-200 overflow-hidden relative">

        {/* Header */}
        <div className="bg-stone-100 p-4 flex justify-between items-center border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${mood === 'happy' ? 'bg-green-500' : mood === 'sad' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="font-bold text-stone-600 uppercase tracking-widest text-sm">Hedgehog OS v1.0</span>
          </div>
          <div className="font-mono text-xs text-stone-400">Day 1</div>
        </div>

        {/* Game Scene */}
        <div className="relative h-80 bg-[#fdf6e3] flex flex-col items-center justify-center overflow-hidden border-b-4 border-stone-200">
          {/* Background Decor */}
          <div className="absolute top-10 right-10 opacity-20 text-stone-300">
            {currentAction === 'sleep' ? <Moon size={48} /> : <Sun size={48} />}
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="absolute top-4 bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-stone-100 animate-bounce">
              <p className="text-sm font-bold text-stone-600">{notifications[0]}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-stone-100 rotate-45"></div>
            </div>
          )}

          {/* Effects */}
          {currentAction === 'sleep' && (
            <div className="absolute top-20 right-20 flex flex-col items-center animate-pulse">
              <span className="text-2xl font-bold text-blue-300 animate-bounce" style={{ animationDelay: '0s' }}>Z</span>
              <span className="text-xl font-bold text-blue-300 animate-bounce" style={{ animationDelay: '0.2s' }}>z</span>
              <span className="text-lg font-bold text-blue-300 animate-bounce" style={{ animationDelay: '0.4s' }}>z</span>
            </div>
          )}
          {currentAction === 'clean' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Sparkles className="text-blue-400 animate-ping absolute top-1/3 left-1/3" size={32} />
              <Sparkles className="text-cyan-400 animate-ping absolute bottom-1/3 right-1/3" style={{ animationDelay: '0.2s' }} size={24} />
            </div>
          )}
          {currentAction === 'eat' && (
            <Heart className="absolute top-24 text-red-400 animate-ping" fill="currentColor" size={24} />
          )}

          {/* The Pixel Pet */}
          <div className="z-10 mt-8">
            <PixelHedgehog action={currentAction} frameTick={frameTick} />
          </div>

          {/* Floor Shadow */}
          <div className="w-32 h-4 bg-stone-800/10 rounded-[100%] blur-sm -mt-4"></div>
        </div>

        {/* Control Panel */}
        <div className="p-6 bg-stone-50">

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6">
            <ProgressBar value={stats.hunger} color="bg-orange-400" icon={Utensils} label="Hunger" />
            <ProgressBar value={stats.energy} color="bg-blue-400" icon={Zap} label="Energy" />
            <ProgressBar value={stats.happiness} color="bg-pink-400" icon={Heart} label="Happy" />
            <ProgressBar value={stats.cleanliness} color="bg-cyan-400" icon={Sparkles} label="Clean" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <ActionButton
              onClick={() => handleAction('feed')}
              icon={Utensils}
              label="FEED"
              colorClass="text-orange-500"
              disabled={currentAction !== 'idle'}
            />
            <ActionButton
              onClick={() => handleAction('play')}
              icon={Heart}
              label="PLAY"
              colorClass="text-pink-500"
              disabled={currentAction !== 'idle'}
            />
            <ActionButton
              onClick={() => handleAction('clean')}
              icon={Sparkles}
              label="CLEAN"
              colorClass="text-cyan-500"
              disabled={currentAction !== 'idle'}
            />
            <ActionButton
              onClick={() => handleAction(currentAction === 'sleep' ? 'wake' : 'sleep')}
              icon={currentAction === 'sleep' ? Sun : Moon}
              label={currentAction === 'sleep' ? "WAKE" : "SLEEP"}
              colorClass="text-blue-600"
              disabled={currentAction !== 'idle' && currentAction !== 'sleep'}
            />
          </div>
        </div>

        <div className="text-center p-2 text-[10px] text-stone-300 font-mono uppercase bg-stone-100 border-t border-stone-200">
          Keep your hedgehog happy!
        </div>

      </div>
    </div>
  );
}