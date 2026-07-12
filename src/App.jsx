import { useRef, useState, useCallback } from "react";
import CV from "./components/CV";
import Background from "./components/Background";
import GlassOrbs from "./components/GlassOrbs";
import { exportPDF, exportPNG, exportJPEG } from "./utils/export";
import { load } from "js-yaml";
import raw from "./data/resume.yaml?raw";
import photo from "./data/me.jpg";

const resume = load(raw);

function App() {
  const cvRef = useRef(null);
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = useCallback(async (type) => {
    setError(null);
    const element = cvRef.current;
    if (!element) {
      setError("CV element not found — report this bug");
      return;
    }
    setExporting(type);
    try {
      switch (type) {
        case "pdf":
          await exportPDF(element);
          break;
        case "png":
          await exportPNG(element);
          break;
        case "jpeg":
          await exportJPEG(element);
          break;
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Export failed");
    } finally {
      setExporting(null);
    }
  }, []);

  const btnBase =
    "px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 cursor-pointer font-mono tracking-wide backdrop-blur-md";

  const glassBtn = {
    color: "#d4d4d8",
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(10px) saturate(150%)",
    WebkitBackdropFilter: "blur(10px) saturate(150%)",
    border: "1px solid rgba(139, 92, 246, 0.12)",
  };

  const primaryBtn = {
    color: "#fafafa",
    background:
      "linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(124,58,237,0.4) 100%)",
    backdropFilter: "blur(10px) saturate(150%)",
    WebkitBackdropFilter: "blur(10px) saturate(150%)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
  };

  return (
    <div
      className="min-h-screen relative print:bg-white"
      style={{ backgroundColor: "#09090b" }}
    >
      <Background />
      <GlassOrbs />

      <div className="relative z-10">
        {/* Toolbar */}
        <div
          className="sticky top-0 z-20 border-b print:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(9,9,11,0.92) 0%, rgba(13,13,18,0.85) 100%)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderColor: "rgba(139, 92, 246, 0.1)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
          }}
        >
          {/* Toolbar reflection line */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.15) 50%, transparent 90%)",
            }}
          />

          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <span
              className="text-sm font-heading font-semibold tracking-wide"
              style={{
                background:
                  "linear-gradient(135deg, #c4b5fd 0%, #d4d4d8 60%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 6px rgba(139,92,246,0.25))",
              }}
            >
              Curriculum Vitae
            </span>
            <div className="flex gap-2">
              {["pdf", "png", "jpeg"].map((type) => {
                const isPrimary = type === "pdf";
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={exporting !== null}
                    onClick={() => handleExport(type)}
                    className={`${btnBase} ${
                      exporting !== null
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-105 hover:-translate-y-px"
                    }`}
                    style={{
                      ...(isPrimary ? primaryBtn : glassBtn),
                      ...(exporting !== null ? {} : {}),
                    }}
                  >
                    {exporting === type
                      ? "Exporting…"
                      : `Export ${type.toUpperCase()}`}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              className="max-w-3xl mx-auto px-4 py-2 text-sm"
              style={{
                color: "#fca5a5",
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="py-8 sm:py-10 print:py-0 flex justify-center">
          <CV ref={cvRef} data={resume} photo={photo} />
        </div>
      </div>

      {exporting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center print:hidden"
          style={{
            background: "rgba(9, 9, 11, 0.7)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            className="flex flex-col items-center gap-4 px-10 py-8 rounded-2xl"
            style={{
              background: "rgba(19, 19, 24, 0.9)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              boxShadow:
                "0 0 60px rgba(139, 92, 246, 0.1), 0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(139,92,246,0.15)",
                borderTopColor: "#8b5cf6",
                borderRightColor: "rgba(139,92,246,0.4)",
              }}
            />
            <span
              className="text-sm font-mono tracking-wide"
              style={{ color: "#d4d4d8" }}
            >
              Generating {exporting.toUpperCase()}…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
