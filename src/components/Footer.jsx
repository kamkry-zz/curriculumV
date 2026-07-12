import { useState, useCallback } from "react";

const imageTag = __IMAGE_TAG__;
const repoUrl = __REPO_URL__;
const dockerCmd = `docker run -p 8080:8080 ghcr.io/kamkry-zz/curriculumv:${imageTag}`;

const linkStyle = {
  color: "#a78bfa",
  textDecoration: "none",
  transition: "color 0.2s",
};

function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(dockerCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, []);

  return (
    <footer
      className="my-4 flex justify-center print:hidden"
      data-export-block={false}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl mx-4"
        style={{
          maxWidth: "210mm",
          width: "100%",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(10px) saturate(150%)",
          WebkitBackdropFilter: "blur(10px) saturate(150%)",
          border: "1px solid rgba(139, 92, 246, 0.12)",
        }}
      >
        {/* Source code link */}
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-mono font-medium group"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#c4b5fd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a78bfa";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
          <span>Star on GitHub</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="opacity-50"
            aria-hidden="true"
          >
            <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h-.004a.752.752 0 0 0-.707.5.75.75 0 0 1-.393.427L9.279 1.98a.75.75 0 1 1 .558 1.392l-.34.136.343.137a.75.75 0 0 1-.552 1.394L9.053 4.96l.306.122a.751.751 0 0 1-.008 1.406l-1.864.746a.75.75 0 1 1-.558-1.392l1.57-.628-1.57-.628a.75.75 0 1 1 .558-1.392l2.212.885a.75.75 0 0 1 .38.331 1.248 1.248 0 0 1 .135-.425l.745-1.864A.75.75 0 0 1 12.75 2h.004a.75.75 0 0 1 .696 1.06l-.746 1.864a.746.746 0 0 1-.178.273l.464.185a.751.751 0 0 1-.553 1.395l-.22-.088.22.088a.75.75 0 0 1 .553 1.394l-.463-.185a.747.747 0 0 1-.087.062l.855.342a.75.75 0 1 1-.56 1.392l-1.863-.745a.75.75 0 0 1-.269-1.13c.12-.16.275-.277.443-.24l.844.338.543-.218-.543-.218a.75.75 0 0 1 .559-1.392l.231.093-.231-.093a.75.75 0 0 1-.258-.091l.093-.038-.093.038a.75.75 0 0 1-.302-.129l-.12-.048.613.245a.75.75 0 0 1-.56 1.392l-.264-.106.513.206a.75.75 0 0 1-.553 1.395l-.22-.088.22.088a.75.75 0 0 1 .553 1.394l-.509-.203.588.235a.75.75 0 0 1-.556 1.393L7.09 11.65a.75.75 0 0 1-.681-.071.752.752 0 0 1-.203-.86l1.02-2.55a.754.754 0 0 1 .399-.403l.07-.028-.07-.027a.751.751 0 0 1-.4-.404l-.305-.762.305.762a.75.75 0 0 1 .4.403l1.02 2.55c.048.12.178.179.298.129a.252.252 0 0 0 .129-.298l-1.02-2.55a.751.751 0 0 1-.4-.403l-.695-1.738.695 1.738a.751.751 0 0 1 .4.403l.834 2.084a.25.25 0 0 0 .339.134.252.252 0 0 0 .134-.34l-.835-2.086a.75.75 0 0 1-.392-.392l-.407-1.016.407 1.016a.751.751 0 0 1 .392.392l.735 1.837a.25.25 0 0 0 .057.078.5.5 0 0 1-.443.248h-.004a.75.75 0 0 1-.696-1.06l.746-1.864a.754.754 0 0 1 .399-.403c.057-.023.117-.039.178-.047ZM4.5 4.25a.75.75 0 0 1 .75.75v1.25H6.5a.75.75 0 0 1 0 1.5H5.25V9a.75.75 0 0 1-1.5 0V7.75H2.5a.75.75 0 0 1 0-1.5h1.25V5a.75.75 0 0 1 .75-.75Z" />
          </svg>
        </a>

        {/* Version tag */}
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-md"
          style={{
            color: "#a1a1aa",
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          v{imageTag}
        </span>

        {/* Docker command */}
        <div className="flex items-center gap-2">
          <code
            className="text-xs font-mono px-2 py-1 rounded-md truncate max-w-[220px] sm:max-w-xs"
            style={{
              color: "#d4d4d8",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(139, 92, 246, 0.1)",
            }}
          >
            {dockerCmd}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-mono font-medium px-2 py-1 rounded-md cursor-pointer transition-all duration-200"
            style={{
              color: copied ? "#a78bfa" : "#d4d4d8",
              background: copied
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${copied ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.12)"}`,
            }}
          >
            {copied ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
