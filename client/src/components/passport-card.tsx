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
        width: "100%",
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
          width: "180px",
          height: "180px",
          opacity: 0.05,
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
      <div style={{ height: "3px", background: "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)" }} />

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
            style={
              pdfMode
                ? {
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "38px",
                    letterSpacing: "0.18em",
                    lineHeight: 1,
                    color: "#c9962a",
                  }
                : {
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "38px",
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
                  gap: "3px",
                }}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(0,0,0,0.13)" }} />
                <div style={{ width: "46px", height: "26px", borderRadius: "50% 50% 0 0", background: "rgba(0,0,0,0.09)" }} />
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
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "stretch" }}>
          {fields.map((f, i, arr) => (
            <div
              key={f.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "5px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.35)", marginBottom: "2px" }}>
                {f.label}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
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
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.3)", marginBottom: "1px" }}>
            Pass ID:
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "rgba(0,0,0,0.42)", letterSpacing: "0.1em" }}>
            {pass.id}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.3)", marginBottom: "1px" }}>
            Signature:
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "13px", color: "rgba(0,0,0,0.42)" }}>
            After Dark Socials
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)" }} />
    </div>
  );
}
