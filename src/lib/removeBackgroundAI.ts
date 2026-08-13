/**
 * Google MediaPipe AI Selfie & Portrait Segmentation
 * 100% Free, Zero API Key, Fast & Ultra-Clean Cutout for Passport & ID Photos
 */

let mediaPipeLoaded = false;
let mediaPipePromise: Promise<any> | null = null;

function loadMediaPipeScript(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MediaPipe only runs in browser.'));
  }
  if ((window as any).SelfieSegmentation) {
    return Promise.resolve((window as any).SelfieSegmentation);
  }
  if (mediaPipePromise) return mediaPipePromise;

  mediaPipePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="selfie_segmentation"]');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).SelfieSegmentation));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      if ((window as any).SelfieSegmentation) {
        resolve((window as any).SelfieSegmentation);
      } else {
        reject(new Error('MediaPipe SelfieSegmentation not found after script load.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load MediaPipe AI library.'));
    };
    document.head.appendChild(script);
  });

  return mediaPipePromise;
}

/**
 * Remove background from an image using Google MediaPipe AI.
 * Returns a transparent PNG Data URL or Blob URL.
 */
export async function removeBackgroundWithAI(
  imageSource: string | Blob | File | HTMLImageElement,
  onProgress?: (progressText: string, percentage: number) => void
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('AI background removal only runs in browser.');
  }

  onProgress?.('Initialisation du modèle IA Google MediaPipe...', 20);

  const SelfieSegmentation = await loadMediaPipeScript();

  onProgress?.('Chargement des poids du réseau de neurones...', 40);

  // Prepare source image element
  let imgEl: HTMLImageElement;
  if (imageSource instanceof HTMLImageElement) {
    imgEl = imageSource;
  } else {
    imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    const src =
      typeof imageSource === 'string'
        ? imageSource
        : URL.createObjectURL(imageSource);
    await new Promise((resolve, reject) => {
      imgEl.onload = resolve;
      imgEl.onerror = reject;
      imgEl.src = src;
    });
  }

  onProgress?.('Segmentation et détourage IA du portrait...', 70);

  return new Promise((resolve, reject) => {
    try {
      const segmenter = new SelfieSegmentation({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      segmenter.setOptions({
        modelSelection: 1, // 1 = landscape/portrait high accuracy model
        selfieMode: false,
      });

      segmenter.onResults((results: any) => {
        try {
          const w = imgEl.naturalWidth || imgEl.width || 600;
          const h = imgEl.naturalHeight || imgEl.height || 800;

          // 1. Create a mask canvas
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = w;
          maskCanvas.height = h;
          const mCtx = maskCanvas.getContext('2d');
          if (!mCtx) throw new Error('Canvas 2D not supported');

          // Draw the AI segmentation mask
          mCtx.drawImage(results.segmentationMask, 0, 0, w, h);

          // 2. Create output canvas
          const outCanvas = document.createElement('canvas');
          outCanvas.width = w;
          outCanvas.height = h;
          const outCtx = outCanvas.getContext('2d');
          if (!outCtx) throw new Error('Canvas 2D not supported');

          // Draw original image
          outCtx.drawImage(results.image, 0, 0, w, h);

          // Destination-in composite with mask
          outCtx.globalCompositeOperation = 'destination-in';
          outCtx.drawImage(maskCanvas, 0, 0, w, h);

          outCtx.globalCompositeOperation = 'source-over';

          onProgress?.('Finalisation HD...', 100);
          const dataUrl = outCanvas.toDataURL('image/png');
          segmenter.close();
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      });

      segmenter.send({ image: imgEl }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
