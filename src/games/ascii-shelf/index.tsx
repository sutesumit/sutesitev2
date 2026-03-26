// Each line is an explicit string so spaces are never collapsed,
// escaped, or trimmed by JSX template processing.
const SHELF_LINES = [
  "       .--.                    .---.",
  "   .---|__|            .-.     |~~~|",
  ".--|===|--|_           |_|     |~~~|--.",
  "|  |===|  |'\\      .---!~|  .--|   |--|",
  "|%%|   |  |.'\\     |===| |--|%%|   |  |",
  "|%%|   |  |\\.'\\    |   | |__|  |   |  |",
  "|  |   |  | \\  \\   |===| |==|  |   |  |",
  "|  |   |__|  \\.'\\  |   |_|__|  |~~~|__|",
  "|  |===|--|   \\.'\\ |===|~|--|%%|~~~|--|",
  "^--^---'--^    `-'`---^-^--^--^---'--'",
];

export default function AsciiShelf() {
  return (
    <div style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden" }}>
      <pre
        aria-hidden="true"
        style={{
          // Courier New has perfectly square fixed-width cells — the gold
          // standard for ASCII art across every OS and browser.
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "14px",
          // Unitless 1 = exactly one line-height, zero extra vertical gap.
          lineHeight: 1,
          // Zero out anything that could nudge a character off its grid cell.
          letterSpacing: "0px",
          wordSpacing: "0px",
          // pre = preserve every space and newline, no wrapping.
          whiteSpace: "pre",
          // Kill default <pre> margin/padding so nothing shifts the grid.
          margin: 0,
          padding: 0,
          // color: "#3b82f6",
          // Disable subpixel antialiasing — it can subtly shift glyph widths.
          WebkitFontSmoothing: "none",
          MozOsxFontSmoothing: "unset",
        }}
      >
        {SHELF_LINES.join("\n")}
      </pre>
    </div>
  );
}