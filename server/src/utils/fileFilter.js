
const allowed = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".go",
  ".rb",
  ".php",
  ".cs",
  ".cpp",
  ".c",
  ".h",
  ".html",
  ".css",
  ".json",
  ".md",
  ".txt",
  ".sql",
  ".sh"
]);

export function fileFilter(_req, file, cb) {
  const dot = file.originalname.lastIndexOf(".");

  const ext =
    dot >= 0
      ? file.originalname.slice(dot).toLowerCase()
      : "";

  cb(null, allowed.has(ext));
}

export default fileFilter;
