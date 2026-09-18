import { jsPDF } from "jspdf";

interface PassData {
  name: string;
  table: string;
  date: string;
  venue?: string;
  passId: string;
  photoUrl?: string;
}

export async function generatePassPDF(data: PassData): Promise<void> {
  await document.fonts.ready;

  const CARD_W = 856;
  const CARD_H = 540;
  const RADIUS = 16;

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;

  const goldGrad = ctx.createLinearGradient(0, 0, CARD_W, 0);
  goldGrad.addColorStop(0, "#b8860b");
  goldGrad.addColorStop(0.3, "#f5d76e");
  goldGrad.addColorStop(0.5, "#c9962a");
  goldGrad.addColorStop(0.7, "#f5d76e");
  goldGrad.addColorStop(1, "#b8860b");

  // ── Background ──
  ctx.save();
  roundRect(ctx, 0, 0, CARD_W, CARD_H, RADIUS);
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bgGrad.addColorStop(0, "#f2ede0");
  bgGrad.addColorStop(1, "#e9e2cc");
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.restore();

  // ── Border ──
  ctx.save();
  roundRect(ctx, 0, 0, CARD_W, CARD_H, RADIUS);
  ctx.strokeStyle = "#7a1515";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // ── Paper lines ──
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.018)";
  ctx.lineWidth = 1;
  for (let y = 0; y < CARD_H; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CARD_W, y);
    ctx.stroke();
  }
  ctx.restore();

  // ── Globe watermark ──
  drawGlobe(ctx, CARD_W / 2 + 80, CARD_H / 2, 0.09, 160, 110);

  // ── Gold bars ──
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, CARD_W, 10);
  ctx.fillRect(0, CARD_H - 10, CARD_W, 10);

  // ── Header: ACCESS title ──
  ctx.save();
  ctx.font = 'bold 72px "Bebas Neue", Impact, sans-serif';
  ctx.fillStyle = "#c9962a";
  ctx.fillText("ACCESS", 30, 100);
  ctx.restore();

  // ── Header subtitle ──
  ctx.save();
  ctx.font = '500 18px "DM Mono", monospace';
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillText("PRIVATE SOCIAL CLUB  ·  MEMBER PASS", 32, 126);
  ctx.restore();

  // ── Header divider ──
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 145);
  ctx.lineTo(CARD_W - 20, 145);
  ctx.stroke();
  ctx.restore();

  // ── Emblem circle ──
  ctx.save();
  ctx.strokeStyle = "rgba(122,21,21,0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CARD_W - 60, 85, 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 28px "Bebas Neue", Impact, sans-serif';
  ctx.fillStyle = "rgba(122,21,21,0.55)";
  ctx.textAlign = "center";
  ctx.fillText("A", CARD_W - 60, 95);
  ctx.textAlign = "left";
  ctx.restore();

  // ── Photo box ──
  const photoX = 30;
  const photoY = 165;
  const photoW = 180;
  const footerHeight = 90;
  const photoH = CARD_H - footerHeight - photoY - 20;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  if (data.photoUrl) {
    try {
      const img = await loadImage(data.photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      const scale = Math.max(photoW / img.width, photoH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = photoX + (photoW - dw) / 2;
      const dy = photoY;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } catch (_) { /* skip on load error */ }
  } else {
    // Silhouette placeholder — centered within the new dynamic photoH
    const silCx = photoX + photoW / 2;
    const silHeadY = photoY + photoH * 0.38;
    const silBodyY = photoY + photoH * 0.74;
    ctx.fillStyle = "rgba(0,0,0,0.13)";
    ctx.beginPath();
    ctx.arc(silCx, silHeadY, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.beginPath();
    ctx.ellipse(silCx, silBodyY, 68, 50, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ── Photo label ──
  ctx.save();
  ctx.font = '400 14px "DM Mono", monospace';
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.textAlign = "center";
  ctx.fillText("MEMBER PHOTO", photoX + photoW / 2, photoY + photoH + 24);
  ctx.textAlign = "left";
  ctx.restore();

  // ── Fields ──
  const fieldX = 240;
  const fields = [
    { label: "Name:", value: data.name.toUpperCase() },
    { label: "Place of Access:", value: "MAURITIUS" },
    { label: "Table:", value: data.table.toUpperCase() },
    { label: "Date:", value: data.date.toUpperCase() },
  ];

  const fieldStartY = 175;
  const fieldHeight = (photoH - 10) / fields.length;

  fields.forEach((field, i) => {
    const y = fieldStartY + i * fieldHeight;

    if (i < fields.length - 1) {
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fieldX, y + fieldHeight - 2);
      ctx.lineTo(CARD_W - 30, y + fieldHeight - 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.font = "italic 400 18px Georgia, serif";
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillText(field.label, fieldX, y + 22);
    ctx.restore();

    ctx.save();
    ctx.font = '500 22px "DM Mono", monospace';
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(field.value, fieldX, y + 52);
    ctx.restore();
  });

  // ── Footer divider ──
  const footerY = CARD_H - footerHeight;
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, footerY);
  ctx.lineTo(CARD_W - 20, footerY);
  ctx.stroke();
  ctx.restore();

  // ── Pass ID ──
  ctx.save();
  ctx.font = "italic 400 16px Georgia, serif";
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillText("Pass ID:", 30, footerY + 28);
  ctx.font = '400 20px "DM Mono", monospace';
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillText(data.passId, 30, footerY + 56);
  ctx.restore();

  // ── Signature ──
  ctx.save();
  ctx.font = "italic 400 16px Georgia, serif";
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.textAlign = "right";
  ctx.fillText("Signature:", CARD_W - 30, footerY + 28);
  ctx.font = "italic 400 28px Georgia, serif";
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillText("After Dark Socials", CARD_W - 30, footerY + 58);
  ctx.textAlign = "left";
  ctx.restore();

  // ── Venue (centered, below footer) ──
  ctx.save();
  ctx.font = '400 14px "DM Mono", monospace';
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.textAlign = "center";
  ctx.fillText(data.venue || "Club Sixty Nine", CARD_W / 2, footerY + 82);
  ctx.textAlign = "left";
  ctx.restore();

  // ── Export as PDF ──
  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [85.6, 54],
  });
  pdf.addImage(imgData, "PNG", 0, 0, 85.6, 54);
  const pdfBlob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `ACCESS-PASS-${data.passId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  opacity: number,
  rx: number,
  ry: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.6, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.28, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  [-ry * 0.4, 0, ry * 0.4].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy + offset);
    ctx.lineTo(cx + rx, cy + offset);
    ctx.stroke();
  });

  ctx.restore();
}
