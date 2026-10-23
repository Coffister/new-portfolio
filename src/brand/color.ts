// HEX -> RGB / HSL / CMYK for the palette block. CMYK from RGB ignores colour
// profiles, so the guide labels it approximate unless the brand gives its own.

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, Math.round(l * 100)];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return [Math.round(((h * 60) + 360) % 360), Math.round(s * 100), Math.round(l * 100)];
}

export function rgbToCmyk([r, g, b]: [number, number, number]): [number, number, number, number] {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return [0, 0, 0, 100];
  const c = (1 - r / 255 - k) / (1 - k);
  const m = (1 - g / 255 - k) / (1 - k);
  const y = (1 - b / 255 - k) / (1 - k);
  return [c, m, y, k].map((v) => Math.round(v * 100)) as [number, number, number, number];
}

/** text colour that stays readable on the given swatch */
export function inkFor(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#0C0C0C" : "#FFFFFF";
}
