// WhatsApp number for wa.me: digits only, local 8-digit Mauritian numbers get 230.
export function waNumber(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length === 8 ? `230${digits}` : digits;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export type ShareOutcome = "shared" | "downloaded" | "cancelled";

/**
 * Hands PDFs to WhatsApp. On a phone the native share sheet attaches the
 * file(s) directly (pick the chat). On desktop, WhatsApp Web can't receive
 * files from a link, so download them and open a prefilled chat with `phone`
 * for a manual attach.
 */
export async function shareFilesToWhatsApp(opts: {
  files: { blob: Blob; name: string }[];
  message: string;
  title: string;
  phone?: string | null;
}): Promise<ShareOutcome> {
  const files = opts.files.map((f) => new File([f.blob], f.name, { type: "application/pdf" }));
  if (navigator.share && navigator.canShare?.({ files })) {
    try {
      await navigator.share({ title: opts.title, text: opts.message, files });
      return "shared";
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return "cancelled";
      // Share failed for another reason — fall through to download.
    }
  }
  opts.files.forEach((f, i) => setTimeout(() => downloadBlob(f.blob, f.name), i * 300));
  setTimeout(() => {
    window.open(`https://wa.me/${waNumber(opts.phone)}?text=${encodeURIComponent(opts.message)}`, "_blank");
  }, opts.files.length * 300 + 300);
  return "downloaded";
}

/** Toast text for a share outcome. `who` is e.g. "the buyer's" / "the booker's". */
export function shareOutcomeToast(outcome: ShareOutcome, count: number, who: string) {
  if (outcome === "shared") {
    return { title: "Ready to send", description: `Pick ${who} WhatsApp chat — ${count === 1 ? "the PDF is" : `all ${count} PDFs are`} attached.` };
  }
  if (outcome === "cancelled") return { title: "Share cancelled" };
  return {
    title: count === 1 ? "PDF downloaded" : `${count} PDFs downloaded`,
    description: "WhatsApp Web can't auto-attach files — drag the downloaded PDF(s) into the chat that just opened.",
  };
}
