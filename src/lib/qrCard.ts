export interface GenerateQrCardOptions {
  qrDataUrl: string;
  url: string;
  brandName?: string;
  brandTagline?: string;
  width?: number;
  height?: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

export async function generateQrCardImage({
  qrDataUrl,
  url,
  brandName = 'QR Flash Code',
  brandTagline = 'Instant QR Code',
  width = 600,
  height = 400,
}: GenerateQrCardOptions): Promise<{ dataUrl: string; blob: Blob }> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Background gradient (brand colors in HSL)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'hsl(262 83% 58%)');
  gradient.addColorStop(1, 'hsl(230 83% 58%)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Card surface
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 16);
  ctx.fill();

  // Brand title
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(brandName, width / 2, 78);

  // Tagline
  ctx.font = '16px Arial';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(brandTagline, width / 2, 106);

  // URL (truncate if too long)
  const formattedUrl = (() => {
    try {
      // Ensure protocol for visual consistency
      const hasProtocol = /^(http|https):\/\//i.test(url);
      return hasProtocol ? url : `https://${url}`;
    } catch {
      return url;
    }
  })();
  ctx.font = '16px Arial';
  ctx.fillStyle = '#374151';
  const urlMaxWidth = width - 200;
  let urlDisplay = formattedUrl;
  if (ctx.measureText(formattedUrl).width > urlMaxWidth) {
    urlDisplay = formattedUrl.slice(0, 40) + '…';
  }
  ctx.fillText(urlDisplay, width / 2, 132);

  // Draw QR image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      // QR size and position
      const qrSize = 200;
      const qrX = (width - qrSize) / 2;
      const qrY = 150;

      // QR container background
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12);
      ctx.fill();

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
      ctx.shadowColor = 'transparent';

      // Footer note
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Scan to visit the link', width / 2, height - 30);

      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load QR image'));
    img.src = qrDataUrl;
  });

  const dataUrl = canvas.toDataURL('image/png');

  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
  });

  return { dataUrl, blob };
}
