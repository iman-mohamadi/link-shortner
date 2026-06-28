import type { Variants, Transition } from "framer-motion"

/* Signature easing curves for the "liquid chrome" motion language. */
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  liquid: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

export const spring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 0.9,
}

/* Reveal-on-scroll: blur + rise. Use with whileInView. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: ease.out },
  },
}

export const revealFast: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: ease.out } },
}

/* Stagger parent for groups of children. */
export const stagger = (delay = 0, each = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: { delayChildren: delay, staggerChildren: each },
  },
})

/* Per-word/letter kinetic heading reveal. */
export const wordUp: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.8, ease: ease.liquid },
  },
}

export const viewport = { once: true, margin: "-12% 0px -12% 0px" } as const
