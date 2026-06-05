import type { StageName } from "./constants";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_TYPE_LABEL = "JPEG, PNG, or WebP";
export const MAX_ORIGINAL_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_COMPRESSED_IMAGE_BYTES = 480_000;
export const MAX_IMAGE_DIMENSION = 1200;

export type PosterImage = {
  stage: StageName;
  fileName: string;
  mimeType: "image/jpeg";
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
};

export function isAcceptedImageType(type: string): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(type as (typeof ACCEPTED_IMAGE_TYPES)[number]);
}

export async function compressImageFile(file: File, stage: StageName): Promise<PosterImage> {
  if (!isAcceptedImageType(file.type)) {
    throw new Error(`Please upload ${ACCEPTED_IMAGE_TYPE_LABEL}.`);
  }

  if (file.size > MAX_ORIGINAL_IMAGE_BYTES) {
    throw new Error("That photo is too large to process in the browser. Try a smaller photo or screenshot.");
  }

  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("That image could not be read. Try another photo.");
  }

  let maxDimension = MAX_IMAGE_DIMENSION;
  let quality = 0.78;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Your browser could not prepare this image for upload.");
    }

    context.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);

    if (blob.size <= MAX_COMPRESSED_IMAGE_BYTES) {
      const dataUrl = await readBlobAsDataUrl(blob);
      return {
        stage,
        fileName: file.name,
        mimeType: "image/jpeg",
        dataUrl,
        base64: dataUrlToBase64(dataUrl),
        width,
        height,
        sizeBytes: blob.size,
        originalSizeBytes: file.size
      };
    }

    if (quality > 0.52) {
      quality -= 0.1;
    } else {
      maxDimension = Math.max(720, maxDimension - 180);
      quality = 0.72;
    }
  }

  throw new Error("That photo is still too large after compression. Try cropping it closer to the poster.");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be opened. Try another photo."));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Your browser could not compress this image."));
        }
      },
      type,
      quality
    );
  });
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Your browser could not preview this image."));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBase64(dataUrl: string): string {
  const [, base64 = ""] = dataUrl.split(",");
  return base64;
}
