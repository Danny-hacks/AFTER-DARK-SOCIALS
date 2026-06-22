export interface PassFields {
  name: string;
  tableLabel: string;
  photo: string;
  id: string;
}

export function PassportCard({ pass, pdfMode = false }: { pass: PassFields; pdfMode?: boolean }) {
  const fields = [
    { label: "Name:", value: pass.name || "\u2014" },
    { label: "Place of Access:", value: "Mauritius" },
    { label: "Table:", value: pass.tableLabel ? pass.tableLabel.toUpperCase() : "\u2014" },
    { label: "Date:", value: "27 JULY 2026" },
  ];

  return (
    <div
      style={{
        width: "323px",
        border: "2px solid #7a1515",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        fontFamily: "'DM Mono', monospace",
        background: "linear-gradient(170deg, #f2ede0 0%, #e9e2cc 100%)",
        position: "relative",
        boxSizing: "border-box",
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
            "repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(0,0,0,0.02) 12px, rgba(0,0,0,0.02) 13px)",
        }}
      />

      {/* Globe watermark */}
      <svg
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "60%",
          height: "80%",
          opacity: 0.09,
          pointerEvents: "none",
          zIndex: 0,
        }}
        viewBox="0 0 260 180"
        fill="none"
      >
        <ellipse cx="130" cy="90" rx="120" ry="78" stroke="black" strokeWidth="1.2" />
        <ellipse cx="130" cy="90" rx="80"  ry="78" stroke="black" strokeWidth="0.9" />
        <ellipse cx="130" cy="90" rx="40"  ry="78" stroke="black" strokeWidth="0.9" />
        <line x1="10" y1="90"  x2="250" y2="90"  stroke="black" strokeWidth="1"   />
        <line x1="10" y1="55"  x2="250" y2="55"  stroke="black" strokeWidth="0.7" />
        <line x1="10" y1="125" x2="250" y2="125" stroke="black" strokeWidth="0.7" />
      </svg>

      {/* Gold top bar */}
      <div style={{ height: "2px", background: "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)", position: "relative", zIndex: 1 }} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px 6px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={
              pdfMode
                ? {
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "22px",
                    letterSpacing: "0.18em",
                    lineHeight: 1,
                    color: "#c9962a",
                  }
                : {
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "22px",
                    letterSpacing: "0.18em",
                    lineHeight: 1,
                    background: "linear-gradient(135deg,#c9962a 0%,#f5d76e 50%,#b8860b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
            }
          >
            ACCESS
          </div>
          <div
            style={{
              fontSize: "5px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.35)",
              paddingLeft: "2px",
              marginTop: "3px",
            }}
          >
            Private Social Club · Member Pass
          </div>
        </div>
        <div
          style={{
            width: "18px",
            height: "18px",
            border: "1px solid rgba(122,21,21,0.38)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "9px",
            color: "rgba(122,21,21,0.55)",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          A
        </div>
      </div>

      {/* Body — natural height, no flex stretching */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "64px 1fr",
          gap: "10px",
          padding: "10px 12px 8px",
          position: "relative",
          zIndex: 1,
          alignItems: "start",
        }}
      >
        {/* Photo */}
        <div>
          <div
            style={{
              width: "64px",
              height: "78px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "rgba(0,0,0,0.06)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {pass.photo ? (
              <img
                src={pass.photo}
                alt="member"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
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
                  gap: "2px",
                }}
              >
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(0,0,0,0.13)" }} />
                <div style={{ width: "30px", height: "17px", borderRadius: "50% 50% 0 0", background: "rgba(0,0,0,0.09)" }} />
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "4px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.28)",
              marginTop: "3px",
              textAlign: "center",
            }}
          >
            {pass.photo ? "Member Photo" : "Photo"}
          </div>
        </div>

        {/* Fields — natural height, packed top, no flex stretching */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {fields.map((f, i, arr) => (
            <div
              key={f.label}
              style={{
                padding: "4px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: "7px",
                color: "rgba(0,0,0,0.35)",
                marginBottom: "2px",
                lineHeight: 1.2,
              }}>
                {f.label}
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                fontWeight: "500",
                color: "#1a1a1a",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "5px 12px 7px",
          borderTop: "1px solid rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.3)", marginBottom: "2px", lineHeight: 1.2 }}>
            Pass ID:
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "rgba(0,0,0,0.42)", letterSpacing: "0.1em", lineHeight: 1.3 }}>
            {pass.id}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.3)", marginBottom: "2px", lineHeight: 1.2 }}>
            Signature:
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", color: "rgba(0,0,0,0.42)", lineHeight: 1.3 }}>
            After Dark Socials
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div style={{ height: "2px", background: "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)", position: "relative", zIndex: 1 }} />
    </div>
  );
}
