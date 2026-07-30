/** Capped stagger delay (ms) for grid entrance animations — keeps long lists from taking forever to finish appearing. */
export const staggerDelay = (index: number, stepMs = 50, maxIndex = 10): string =>
  `${Math.min(index, maxIndex) * stepMs}ms`;
