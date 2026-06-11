import { useState, useRef, useEffect } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// ─── Capacity info type (matches GET /api/access-capacity) ───────────────────
interface PassCapacity {
  count: number;
  max: number;
  remaining: number;
  status: "available" | "low" | "sold_out";
}

function pad(n: number, l: number) {
  return String(n).padStart(l, "0");
}
function rndId() {
  return "ACC-" + pad(Math.floor(Math.random() * 99999), 5);
}

// ─── Passport card ────────────────────────────────────────────────────────────
interface PassFields {
  name: string;
  edition: string;
  passType: string;
  date: string;
  photo: string;
  id: string;
}

function PassportCard({ pass }: { pass: PassFields }) {
  return (
    <div
      id="passport-card"
      style={{
        width: "100%",
        maxWidth: "480px",
        border: "3px solid #7a1515",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        fontFamily: "'DM Mono', monospace",
        background: "linear-gradient(170deg, #f2ede0 0%, #e9e2cc 100%)",
        position: "relative",
      }}
    >
      {/* Paper lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,0,0,0.02) 18px, rgba(0,0,0,0.02) 19px)",
        }}
      />

      {/* Globe watermark */}
      <svg
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "200px",
          height: "150px",
          opacity: 0.05,
          pointerEvents: "none",
          zIndex: 0,
        }}
        viewBox="0 0 260 180"
        fill="none"
      >
        <ellipse
          cx="130"
          cy="90"
          rx="120"
          ry="78"
          stroke="black"
          strokeWidth="1.2"
        />
        <ellipse
          cx="130"
          cy="90"
          rx="80"
          ry="78"
          stroke="black"
          strokeWidth="0.9"
        />
        <ellipse
          cx="130"
          cy="90"
          rx="40"
          ry="78"
          stroke="black"
          strokeWidth="0.9"
        />
        <line x1="10" y1="90" x2="250" y2="90" stroke="black" strokeWidth="1" />
        <line
          x1="10"
          y1="55"
          x2="250"
          y2="55"
          stroke="black"
          strokeWidth="0.7"
        />
        <line
          x1="10"
          y1="125"
          x2="250"
          y2="125"
          stroke="black"
          strokeWidth="0.7"
        />
      </svg>

      {/* Gold top bar */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 18px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "38px",
              letterSpacing: "0.18em",
              lineHeight: 1,
              background:
                "linear-gradient(135deg,#c9962a 0%,#f5d76e 50%,#b8860b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ACCESS
          </div>
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.35)",
              paddingLeft: "2px",
              marginTop: "2px",
            }}
          >
            Private Social Club · Member Pass
          </div>
        </div>
        <div
          style={{
            width: "30px",
            height: "30px",
            border: "1.5px solid rgba(122,21,21,0.38)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "15px",
            color: "rgba(122,21,21,0.55)",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          A
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "96px 1fr",
          gap: "16px",
          padding: "16px 18px",
          position: "relative",
          zIndex: 1,
          alignItems: "stretch",
        }}
      >
        {/* Photo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: "96px",
              height: "118px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "rgba(0,0,0,0.06)",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {pass.photo ? (
              <img
                src={pass.photo}
                alt="member"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.13)",
                  }}
                />
                <div
                  style={{
                    width: "46px",
                    height: "26px",
                    borderRadius: "50% 50% 0 0",
                    background: "rgba(0,0,0,0.09)",
                  }}
                />
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "6px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.28)",
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            {pass.photo ? "Member Photo" : "Upload Photo"}
          </div>
        </div>

        {/* Fields */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "stretch",
          }}
        >
          {[
            { label: "Name:", value: pass.name || "—" },
            { label: "Place of Access:", value: "Mauritius" },
            { label: "Edition:", value: pass.edition },
            { label: "Date:", value: pass.date || "TBC" },
          ].map((f, i, arr) => (
            <div
              key={f.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "5px 0",
                borderBottom:
                  i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "7px",
                  color: "rgba(0,0,0,0.35)",
                  marginBottom: "2px",
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  fontWeight: "500",
                  color: "#1a1a1a",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "11px 18px 15px",
          borderTop: "1px solid rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: "7px",
              color: "rgba(0,0,0,0.3)",
              marginBottom: "1px",
            }}
          >
            Pass ID:
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              color: "rgba(0,0,0,0.42)",
              letterSpacing: "0.1em",
            }}
          >
            {pass.id}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: "7px",
              color: "rgba(0,0,0,0.3)",
              marginBottom: "1px",
            }}
          >
            Signature:
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: "13px",
              color: "rgba(0,0,0,0.42)",
            }}
          >
            After Dark Socials
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div
        style={{
          height: "3px",
          background:
            "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)",
        }}
      />
    </div>
  );
}

const R2 = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures";

// ─── Past Editions photos — update src / position per image as needed ─────────
const accessPhotos: { src: string | null; position: string; alt: string }[] = [
  { src: `${R2}/Serge_53.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_82.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_70.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_47.jpg`, position: "object-bottom", alt: "ACCESS experience" },
  { src: `${R2}/Serge_49.jpg`, position: "object-bottom", alt: "ACCESS experience" },
  { src: `${R2}/Serge_56.jpg`, position: "object-center", alt: "ACCESS experience" },
];

// ─── Main public component ────────────────────────────────────────────────────
export function AccessPassport() {
  const [form, setForm] = useState({
    name: "",
    edition: "ACCESS I",
    passType: "General Entry",
    date: "",
    phone: "",
    photo: "",
  });
  const [capacity, setCapacity] = useState<Record<string, PassCapacity>>({});
  const [passId] = useState(rndId);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch capacity on mount
  useEffect(() => {
    fetch("/api/access-capacity")
      .then((r) => r.json())
      .then((data: Record<string, PassCapacity>) => {
        if (data) setCapacity(data);
      })
      .catch(() => {});
  }, []);

  const currentCap = capacity[form.passType];
  const remaining = currentCap?.remaining ?? null;
  const currentStatus = currentCap?.status ?? "available";
  const currentFull = currentStatus === "sold_out";
  const currentLow = currentStatus === "low";
  const isFull =
    Object.keys(capacity).length > 0 &&
    Object.values(capacity).every((c) => c.status === "sold_out");

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((f) => ({ ...f, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const sendPass = async () => {
    if (!form.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (currentFull) {
      toast({ title: "This pass type is full", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      await apiRequest("POST", "/api/access-capacity", { type: form.passType });
      // Re-fetch full capacity to get accurate status after increment
      const updated = await fetch("/api/access-capacity").then((r) => r.json());
      if (updated) setCapacity(updated);
    } catch {}

    const msg = `*ACCESS MEMBER PASS*\n\n*Name:* ${form.name.toUpperCase()}\n*Edition:* ${form.edition}\n*Date:* ${form.date || "TBC"}\n*Pass ID:* ${passId}\n\nPresent this pass at the door.\n_After Dark Socials · @afterdarksocials.mu_`;

    // Notify admin
    window.open(
      `https://wa.me/23058205220?text=${encodeURIComponent(`NEW ACCESS APPLICATION\n\n*Name:* ${form.name.toUpperCase()}\n*Pass Type:* ${form.passType}\n*Edition:* ${form.edition}\n*Date:* ${form.date || "TBC"}\n*Phone:* ${form.phone || "Not provided"}\n*Pass ID:* ${passId}`)}`,
      "_blank",
    );

    // Send to attendee if phone provided
    if (form.phone.trim()) {
      const clean = form.phone.replace(/\s+/g, "").replace(/^\+/, "");
      setTimeout(
        () =>
          window.open(
            `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`,
            "_blank",
          ),
        800,
      );
    }

    setSending(false);
    toast({
      title: "Pass sent!",
      description: "You'll receive a confirmation on WhatsApp.",
    });
  };

  const savePass = () => window.print();

  const inputCls =
    "w-full bg-transparent border-0 border-b border-white/12 text-white placeholder:text-white/20 text-sm px-0 py-3 focus:outline-none focus:border-[#c9962a]/50 transition-colors font-mono";
  const labelCls =
    "block text-[9px] text-[#c9962a]/50 uppercase tracking-[0.3em] mb-2";
  const selStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='rgba(201,150,42,0.4)' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0 center",
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="w-8 h-px bg-[#c9962a]" />
          <span className="text-[#c9962a] text-[10px] uppercase tracking-[0.35em]">
            Exclusive Experience
          </span>
        </div>

        {/* Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-16 border-b border-white/10 pb-16">
          <h1
            className="font-black text-white leading-none"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(52px, 9vw, 100px)",
            }}
          >
            RSVP FOR
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#c9962a,#f5d76e,#b8860b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ACCESS.
            </span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm lg:pb-2">
            Fill in your details and your pass generates instantly. Send it to
            yourself via WhatsApp and present it at the door.
          </p>
        </div>

        {isFull ? (
          <div className="border border-[#c72d28]/30 bg-[#c72d28]/8 px-8 py-12 text-center max-w-lg mx-auto">
            <div
              className="font-black text-[#c72d28] mb-3"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "32px",
              }}
            >
              FULLY BOOKED
            </div>
            <p className="text-white/40 text-sm">
              ACCESS is at full capacity. Follow{" "}
              <span className="text-white/60">@afterdarksocials.mu</span> for
              updates on future events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Form */}
            <div className="lg:col-span-5 space-y-7">
              {/* Photo */}
              <div>
                <label className={labelCls}>Your Photo (Optional)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-white/10 hover:border-[#c9962a]/25 transition-colors cursor-pointer p-4 text-center"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                  {form.photo ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={form.photo}
                        alt="preview"
                        className="w-9 h-11 object-cover object-top"
                      />
                      <span className="text-white/35 text-[9px] uppercase tracking-[0.18em]">
                        Photo ready · tap to change
                      </span>
                    </div>
                  ) : (
                    <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">
                      ↑ Upload your photo
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  maxLength={24}
                  className={inputCls}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+230 5XXX XXXX"
                  className={inputCls}
                />
                <p className="text-white/20 text-[9px] mt-1.5 uppercase tracking-[0.15em]">
                  We'll send your pass here
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Edition */}
                <div>
                  <label className={labelCls}>Edition</label>
                  <select
                    value={form.edition}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, edition: e.target.value }))
                    }
                    className={`${inputCls} cursor-pointer appearance-none`}
                    style={selStyle}
                  >
                    <option>ACCESS I</option>
                    <option>ACCESS II</option>
                    <option>ACCESS III</option>
                  </select>
                </div>

                {/* Pass type */}
                <div>
                  <label className={labelCls}>Pass Type</label>
                  <select
                    value={form.passType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, passType: e.target.value }))
                    }
                    className={`${inputCls} cursor-pointer appearance-none`}
                    style={selStyle}
                  >
                    {["General Entry", "Table", "VIP"].map((type) => {
                      const cap = capacity[type];
                      const left = cap?.remaining ?? null;
                      const sold = cap?.status === "sold_out";
                      return (
                        <option key={type} value={type} disabled={sold}>
                          {type}
                          {sold
                            ? " (Full)"
                            : left !== null
                              ? ` (${left} left)`
                              : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Capacity warning */}
              {(currentLow || currentFull) && (
                <div
                  className={`flex items-start gap-2 px-3 py-2.5 border ${
                    currentFull
                      ? "border-[#c72d28]/40 bg-[#c72d28]/8 text-[#c72d28]"
                      : "border-[#c9962a]/40 bg-[#c9962a]/8 text-[#c9962a]"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <p className="text-[9px] uppercase tracking-[0.18em] leading-relaxed">
                    {currentFull
                      ? "This pass type is sold out"
                      : `Only ${remaining} spot${remaining === 1 ? "" : "s"} remaining for ${form.passType}`}
                  </p>
                </div>
              )}

              {/* Date */}
              <div>
                <label className={labelCls}>Event Date</label>
                <input
                  type="text"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  placeholder="e.g. 12 Jul 2026"
                  className={inputCls}
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={savePass}
                  className="flex items-center justify-center gap-2 border border-white/12 text-white/40 hover:text-white hover:border-white/25 text-[9px] uppercase tracking-[0.2em] py-4 transition-colors"
                >
                  <Download className="w-3 h-3" /> Save PDF
                </button>
                <button
                  onClick={sendPass}
                  disabled={sending || currentFull}
                  className="flex items-center justify-center gap-2 bg-[#c9962a] hover:bg-[#b8860b] disabled:opacity-40 text-black text-[9px] uppercase tracking-[0.2em] font-bold py-4 transition-colors"
                >
                  <SiWhatsapp className="w-3 h-3" />
                  {sending ? "Sending..." : "RSVP →"}
                </button>
              </div>
            </div>

            {/* Live passport */}
            <div className="lg:col-span-7 lg:sticky lg:top-8">
              <p className="text-white/20 text-[9px] uppercase tracking-[0.25em] mb-5">
                Your Pass · Updates Live
              </p>
              <PassportCard pass={{ ...form, id: passId }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Past Editions photo section ─────────────────────────────────── */}
      <div className="border-t border-white/10">
        {/* Header */}
        <div className="px-5 sm:px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">
              Past Editions
            </span>
          </div>
          <h2
            className="text-white leading-none mb-4"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(48px, 7vw, 96px)",
            }}
          >
            THE NIGHTS SO FAR.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            A glimpse into what ACCESS looks like.
          </p>
        </div>

        {/* 3×2 photo grid — full bleed */}
        <div className="grid grid-cols-2 gap-0">
          {accessPhotos.map((photo, i) => (
            <div
              key={i}
              className="relative overflow-hidden group h-64 sm:h-80 lg:h-96"
            >
              {photo.src ? (
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className={`absolute inset-0 w-full h-full object-cover ${photo.position} grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700`}
                />
              ) : (
                <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                  <span
                    style={{ fontFamily: "'DM Mono', monospace" }}
                    className="text-white/20 text-xs uppercase tracking-widest"
                  >
                    Photo {i + 1}
                  </span>
                </div>
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
