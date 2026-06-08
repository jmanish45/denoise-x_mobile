/**
 * colors.ts — Denoise X Premium Dark Medical Theme
 * ===================================================
 * Inspired by Apple Health, Linear, Arc Browser.
 * Deep navy/black with soft cyan + teal glow accents.
 */

export const Colors = {
  // ── Background layers ──────────────────────────────────────────────
  bg: {
    primary: '#060A14',       // Deep space black
    secondary: '#0C1222',     // Slightly lighter panel
    tertiary: '#121B2E',      // Card background
    elevated: '#182340',      // Elevated card / modal
    gradient: ['#060A14', '#0C1222', '#0F172A'] as const,
  },

  // ── Surface (cards, inputs) ────────────────────────────────────────
  surface: {
    card: 'rgba(15, 23, 42, 0.85)',
    cardHover: 'rgba(20, 30, 52, 0.9)',
    input: 'rgba(15, 23, 42, 0.6)',
    inputFocus: 'rgba(15, 23, 42, 0.85)',
  },

  // ── Accent colors ─────────────────────────────────────────────────
  accent: {
    primary: '#00D4AA',       // Teal — primary CTA
    primaryDim: 'rgba(0, 212, 170, 0.12)',
    primaryGlow: 'rgba(0, 212, 170, 0.25)',
    secondary: '#3B82F6',     // Electric blue — secondary actions
    secondaryDim: 'rgba(59, 130, 246, 0.12)',
    secondaryGlow: 'rgba(59, 130, 246, 0.25)',
    cyan: '#38BDF8',          // Soft cyan — highlights / badges
    cyanDim: 'rgba(56, 189, 248, 0.12)',
    cyanGlow: 'rgba(56, 189, 248, 0.25)',
    gradient: ['#00D4AA', '#3B82F6'] as const,
    gradientCyan: ['#00D4AA', '#38BDF8'] as const,
  },

  // ── Glow effects ──────────────────────────────────────────────────
  glow: {
    teal: 'rgba(0, 212, 170, 0.35)',
    blue: 'rgba(59, 130, 246, 0.35)',
    cyan: 'rgba(56, 189, 248, 0.35)',
    white: 'rgba(255, 255, 255, 0.08)',
  },

  // ── Text ──────────────────────────────────────────────────────────
  text: {
    primary: '#F1F5F9',       // Bright white
    secondary: '#94A3B8',     // Muted grey
    tertiary: '#64748B',      // Hints
    quaternary: '#475569',    // Ultra muted
    inverse: '#060A14',       // Dark text on light bg
    accent: '#00D4AA',        // Teal text
    cyan: '#38BDF8',          // Cyan text
  },

  // ── Borders & Dividers ────────────────────────────────────────────
  border: {
    subtle: 'rgba(148, 163, 184, 0.08)',
    medium: 'rgba(148, 163, 184, 0.15)',
    strong: 'rgba(148, 163, 184, 0.25)',
    accent: 'rgba(0, 212, 170, 0.3)',
    cyan: 'rgba(56, 189, 248, 0.3)',
    glow: 'rgba(0, 212, 170, 0.15)',
  },

  // ── Status ────────────────────────────────────────────────────────
  status: {
    success: '#10B981',
    successDim: 'rgba(16, 185, 129, 0.12)',
    warning: '#F59E0B',
    warningDim: 'rgba(245, 158, 11, 0.12)',
    error: '#EF4444',
    errorDim: 'rgba(239, 68, 68, 0.12)',
    info: '#3B82F6',
    infoDim: 'rgba(59, 130, 246, 0.12)',
  },

  // ── Glass effect ──────────────────────────────────────────────────
  glass: {
    bg: 'rgba(12, 18, 34, 0.75)',
    bgStrong: 'rgba(12, 18, 34, 0.9)',
    border: 'rgba(148, 163, 184, 0.08)',
    highlight: 'rgba(255, 255, 255, 0.04)',
    highlightStrong: 'rgba(255, 255, 255, 0.08)',
  },

  // ── Overlay ───────────────────────────────────────────────────────
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // ── Tab bar ───────────────────────────────────────────────────────
  tabBar: {
    bg: 'rgba(6, 10, 20, 0.85)',
    active: '#00D4AA',
    inactive: '#475569',
    border: 'rgba(148, 163, 184, 0.06)',
  },
} as const;
