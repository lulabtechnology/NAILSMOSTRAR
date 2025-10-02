'use client';

import type { ImageMeta } from "./types";

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Sobel simple para densidad de bordes (promedio magnitud 0..255)
function sobelEdgeDensity(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const { data } = ctx.getImageData(0, 0, w, h);
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i*4], g = data[i*4+1], b = data[i*4+2];
    gray[i] = (0.299*r + 0.587*g + 0.114*b) | 0;
  }
  const gxK = [-1,0,1,-2,0,2,-1,0,1];
  const gyK = [-1,-2,-1,0,0,0,1,2,1];
  let sum = 0;
  let count = 0;
  for (let y=1; y<h-1; y++) {
    for (let x=1; x<w-1; x++) {
      let gx=0, gy=0, k=0;
      for (let ky=-1; ky<=1; ky++) {
        for (let kx=-1; kx<=1; kx++) {
          const v = gray[(y+ky)*w + (x+kx)];
          gx += gxK[k]*v;
          gy += gyK[k]*v;
          k++;
        }
      }
      const mag = Math.sqrt(gx*gx + gy*gy);
      sum += mag;
      count++;
    }
  }
  return sum / count;
}

export async function analyzeImage(file: File): Promise<ImageMeta> {
  const sizeKB = Math.round(file.size / 1024);
  const img = await loadImage(file);

  // Normalizamos a máximo 640 px para rendimiento
  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);

  const edgeDensity = sobelEdgeDensity(ctx, w, h);
  // Umbrales demo: <18 => 0, 18..35 => 1, >35 => 2
  const complexityScore = edgeDensity < 18 ? 0 : edgeDensity < 35 ? 1 : 2;

  return {
    width: img.width,
    height: img.height,
    megapixels: +(img.width * img.height / 1_000_000).toFixed(2),
    sizeKB,
    edgeDensity: +edgeDensity.toFixed(2),
    complexityScore: complexityScore as 0|1|2,
  };
}
