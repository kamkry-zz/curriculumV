import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";

const SectionTitle = ({ children, index = 0 }) => (
  <h2
    className="animate-in font-heading text-xs font-semibold tracking-[0.2em] uppercase mb-3 pb-2.5 flex items-center gap-2.5"
    style={{
      borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
      color: "#a78bfa",
      animationDelay: `${300 + index * 100}ms`,
    }}
  >
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 35% 35%, rgba(167,139,250,0.9), #8b5cf6)",
        boxShadow: "0 0 10px rgba(139,92,246,0.5), 0 0 2px rgba(255,255,255,0.3)",
        filter: "blur(0.3px)",
      }}
    />
    {children}
  </h2>
);

const DOT_PALETTE = [
  { bg: "#7c3aed", light: "#a78bfa", glow: "rgba(139,92,246,0.6)" },
  { bg: "#8b5cf6", light: "#c4b5fd", glow: "rgba(139,92,246,0.5)" },
  { bg: "#6d28d9", light: "#a78bfa", glow: "rgba(109,40,217,0.55)" },
  { bg: "#a78bfa", light: "#ddd6fe", glow: "rgba(167,139,250,0.45)" },
  { bg: "#7e22ce", light: "#c084fc", glow: "rgba(126,34,206,0.55)" },
  { bg: "#8b5cf6", light: "#d4d4d8", glow: "rgba(139,92,246,0.4)" },
];

const accentGradient = {
  background:
    "linear-gradient(135deg, #c4b5fd 0%, #d4d4d8 35%, #a78bfa 65%, #8b5cf6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  filter: "drop-shadow(0 0 8px rgba(139,92,246,0.3))",
};

function CV({ data, photo, ref: externalRef }) {
  const internalRef = useRef(null);
  const nameRef = useRef(null);
  const cvRef = externalRef || internalRef;

  useEffect(() => {
    const el = cvRef.current;
    if (!el) return;

    const prefersReduced = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const xTo = gsap.quickTo(el, "rotateY", {
      duration: 0.5,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(el, "rotateX", {
      duration: 0.5,
      ease: "power2.out",
    });

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      xTo(((x - cx) / cx) * 5);
      yTo(((y - cy) / cy) * -5);
    };

    const handleLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [cvRef]);

  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    const prefersReduced = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const xTo = gsap.quickTo(el, "x", {
      duration: 0.35,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.35,
      ease: "power2.out",
    });

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      xTo(dx * 0.15);
      yTo(dy * 0.15);
    };

    const handleLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={cvRef}
      id="cv-content"
      className="mx-auto relative print:shadow-none print:mx-0 print:w-full print:min-h-0"
      style={{
        width: "210mm",
        minHeight: "297mm",
        color: "#fafafa",
        fontFamily: "'Inter', system-ui, sans-serif",
        perspective: "1200px",
        transformStyle: "preserve-3d",
        borderRadius: "16px",
        border: "1px solid rgba(139, 92, 246, 0.12)",
        background: "rgba(19, 19, 24, 0.78)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.06), 0 0 80px rgba(139,92,246,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Glass reflection sweep */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: "35%",
          height: "100%",
          background:
            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 70%)",
          transform: "skewX(-12deg)",
          animation: "glass-sweep 8s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* Top edge highlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: "8%",
          right: "8%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(167,139,250,0.25), rgba(212,212,216,0.3), rgba(167,139,250,0.25), transparent)",
          zIndex: 1,
        }}
      />

      <div
        className="p-8 sm:p-10 md:p-12 relative"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <header data-export-block className="mb-8 animate-in flex justify-between items-start gap-6" style={{ animationDelay: "100ms" }}>
          <div className="flex-1 min-w-0">
            <h1
              ref={nameRef}
              className="font-heading text-4xl sm:text-5xl font-bold mb-2 tracking-tight inline-block"
              style={{
                ...accentGradient,
                willChange: "transform",
              }}
            >
              {data.name}
            </h1>
            <p
              className="text-base sm:text-lg mb-4 font-medium font-heading tracking-wide"
              style={{ color: "#d4d4d8" }}
            >
              {data.title}
            </p>
            <div
              className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-mono"
              style={{ color: "#a1a1aa" }}
            >
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="transition-all duration-200"
                  style={{ color: "#a78bfa", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                    e.currentTarget.style.color = "#c4b5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                    e.currentTarget.style.color = "#a78bfa";
                  }}
                >
                  {data.email}
                </a>
              )}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>{data.location}</span>}
              {data.website && (
                <a
                  href={`https://${data.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-200"
                  style={{ color: "#a78bfa", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                    e.currentTarget.style.color = "#c4b5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                    e.currentTarget.style.color = "#a78bfa";
                  }}
                >
                  {data.website}
                </a>
              )}
            </div>
            <div
              className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-mono mt-1"
              style={{ color: "#a1a1aa" }}
            >
              {data.github && (
                <a
                  href={data.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-200"
                  style={{ color: "#a78bfa", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                    e.currentTarget.style.color = "#c4b5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                    e.currentTarget.style.color = "#a78bfa";
                  }}
                >
                  {data.github}
                </a>
              )}
              {data.linkedin && (
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-200"
                  style={{ color: "#a78bfa", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                    e.currentTarget.style.color = "#c4b5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                    e.currentTarget.style.color = "#a78bfa";
                  }}
                >
                  {data.linkedin}
                </a>
              )}
              {data.patents && (
                <a
                  href={data.patents}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-200"
                  style={{ color: "#a78bfa", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline";
                    e.currentTarget.style.color = "#c4b5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none";
                    e.currentTarget.style.color = "#a78bfa";
                  }}
                >
                  Patents (EPO)
                </a>
              )}
            </div>
          </div>
          {photo ? (
            <div
              role="img"
              aria-label={data.name}
              className="w-40 h-40 rounded-full flex-shrink-0"
              style={{
                backgroundImage: `url(${photo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "2px solid rgba(139, 92, 246, 0.25)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0,0,0,0.4)",
              }}
            />
          ) : (
            <div
              className="w-40 h-40 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background: "rgba(139, 92, 246, 0.12)",
                border: "2px solid rgba(139, 92, 246, 0.2)",
                boxShadow: "0 0 16px rgba(139, 92, 246, 0.12), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <span
                className="font-heading text-4xl font-bold"
                style={{ color: "#a78bfa" }}
              >
                {data.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}
        </header>

        {/* Summary */}
        {data.summary && (
          <section data-export-block className="mb-7">
            <SectionTitle index={0}>Summary</SectionTitle>
            <div
              className="animate-in glass-panel"
              style={{ animationDelay: "400ms" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "#a1a1aa" }}>
                {data.summary}
              </p>
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <section className="mb-7">
            <div data-export-block>
              <SectionTitle index={1}>Experience</SectionTitle>
            </div>
            <div className="space-y-4">
              {data.experience.map((exp, i) => {
                const dot = DOT_PALETTE[i % DOT_PALETTE.length];
                return (
                <div
                  key={`${exp.company}-${exp.start}`}
                  className="animate-in"
                  style={{ animationDelay: `${500 + i * 120}ms` }}
                >
                  <div
                    data-export-block
                    className="flex gap-3 rounded-xl p-4 border transition-all duration-300"
                    style={{
                      background: "rgba(255, 255, 255, 0.025)",
                      borderColor: "rgba(139, 92, 246, 0.1)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      boxShadow:
                        "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 animate-glass-reflection inline-block"
                      style={{
                        background: `radial-gradient(circle at 40% 40%, ${dot.light}, ${dot.bg})`,
                        boxShadow: `0 0 12px ${dot.glow}, 0 0 3px rgba(255,255,255,0.2)`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-baseline mb-1.5 gap-x-3">
                        <h3
                          className="font-semibold text-sm"
                          style={{ color: "#fafafa" }}
                        >
                          {exp.title}{" "}
                          <span
                            style={{ color: "#a1a1aa" }}
                            className="font-normal"
                          >
                            at {exp.company}
                          </span>
                        </h3>
                        <span
                          className="text-xs font-mono whitespace-nowrap"
                          style={{ color: "#71717a" }}
                        >
                          {exp.start} — {exp.end}
                        </span>
                      </div>
                      {exp.location && (
                        <p className="text-xs mb-2" style={{ color: "#71717a" }}>
                          {exp.location}
                        </p>
                      )}
                      <ul
                        className="list-disc list-inside text-sm space-y-1"
                        style={{ color: "#a1a1aa" }}
                      >
                        {exp.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <section data-export-block className="mb-7">
            <SectionTitle index={2}>Education</SectionTitle>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div
                  key={`${edu.degree}-${edu.school}`}
                  className="animate-in glass-panel flex justify-between items-baseline"
                  style={{ animationDelay: `${700 + i * 100}ms` }}
                >
                  <div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "#fafafa" }}
                    >
                      {edu.degree}
                    </span>
                    <span style={{ color: "#a1a1aa" }}> — {edu.school}</span>
                  </div>
                  <span
                    className="text-xs font-mono"
                    style={{ color: "#71717a" }}
                  >
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <section data-export-block className="mb-7">
            <SectionTitle index={3}>Skills</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span
                  key={skill}
                  className="animate-in glass-tag text-xs font-medium font-mono cursor-default"
                  style={{ animationDelay: `${800 + i * 50}ms` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages?.length > 0 && (
          <section data-export-block className="mb-7">
            <SectionTitle index={4}>Languages</SectionTitle>
            <div
              className="animate-in flex flex-wrap gap-5 text-sm"
              style={{ color: "#a1a1aa", animationDelay: "1000ms" }}
            >
              {data.languages.map((lang, i) => (
                <span
                  key={lang.language}
                  className="glass-panel inline-block"
                  style={{ animationDelay: `${1050 + i * 80}ms` }}
                >
                  <strong style={{ color: "#fafafa" }}>{lang.language}</strong>{" "}
                  — {lang.level}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.interests?.length > 0 && (
          <section data-export-block>
            <SectionTitle index={5}>Interests</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((item, i) => (
                <span
                  key={item}
                  className="animate-in glass-tag text-xs font-medium font-mono cursor-default"
                  style={{ animationDelay: `${1100 + i * 60}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number,
};

CV.propTypes = {
  data: PropTypes.object.isRequired,
  photo: PropTypes.string,
  ref: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

export default CV;
