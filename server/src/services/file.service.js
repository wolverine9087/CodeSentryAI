export function normalizeSource(body) {
  const source =
    typeof body.source === "string" ? body.source : "";

  if (!source.trim()) {
    const e = new Error("Source code is required");
    e.statusCode = 400;
    throw e;
  }

  if (source.length > 100000) {
    const e = new Error("Source is too large (100 KB maximum)");
    e.statusCode = 413;
    throw e;
  }

  return {
    source,
    filename: String(body.filename || "snippet.js")
      .replace(/[**\\\\**/]/g, "")
      .slice(0, 120) || "snippet.js"
  };
}
