import type { Variants, Transition } from "framer-motion";

// ============================================================
//  Koleksi variants transisi kreatif untuk Framer Motion.
//  Tiap section pakai variant berbeda agar transisi antar
//  fitur terasa dinamis dan tidak monoton.
// ============================================================

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeInOutCirc: [number, number, number, number] = [0.85, 0, 0.15, 1];

// ---- 1. Blur → Focus reveal (untuk teks besar / headline section) ----
export const blurReveal: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(14px)",
    y: 28,
  },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.9, ease: easeOutExpo },
  },
};

// ---- 2. Word stagger (untuk paragraf / statement) ----
export const wordStaggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

export const wordStaggerItem: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotateX: -40 },
  show: {
    opacity: 1,
    y: "0em",
    rotateX: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

// ---- 3. Clip-path diagonal reveal (untuk cards) ----
export const clipReveal: Variants = {
  hidden: {
    opacity: 0,
    clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
    y: 30,
  },
  show: {
    opacity: 1,
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    y: 0,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

// ---- 4. Slide-in dari samping (untuk angka / label section) ----
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

// ---- 5. Scale + fade (untuk gambar / badge) ----
export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: easeOutExpo },
  },
};

// ---- 6. Image mask reveal (reveal vertikal dengan overflow hidden) ----
export const maskReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.15,
    y: 40,
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.0, ease: easeOutExpo },
  },
};

// ---- 7. Stagger container untuk grid ----
export const staggerContainer = (stagger = 0.1, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

// ---- 8. Number count-up reveal (untuk stats / nomor step) ----
export const numberReveal: Variants = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: easeOutExpo },
  },
};

// ---- 9. Split reveal (untuk CTA / heading kontak) ----
export const splitReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

// ---- 10. Section divider: garis emas yang menggambar sendiri ----
export const lineDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.0, ease: easeInOutCirc },
  },
};

// Viewport config default untuk whileInView
export const viewportOnce = { once: true, margin: "-80px" } as const;

export const defaultTransition: Transition = {
  duration: 0.7,
  ease: easeOutExpo,
};
