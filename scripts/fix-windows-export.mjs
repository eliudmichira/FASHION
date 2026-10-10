// Runs after `npm run build`. On Windows, Next 16's static export writes the
// page prefetch files into folders (out/shop/__next.shop/__PAGE__.txt) instead
// of the single file the browser asks for (out/shop/__next.shop.__PAGE__.txt),
// so every prefetch 404s on Firebase Hosting and links fall back to full page
// loads. This moves them to where the browser looks. On macOS and Linux the
// export is already right and nothing moves.
import { readdirSync, renameSync, rmSync } from "node:fs";
import { join, relative, sep } from "node:path";

const out = process.argv[2] ?? "out";
let moved = 0;

function filesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? filesIn(join(dir, e.name)) : [join(dir, e.name)],
  );
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const path = join(dir, entry.name);
    if (!entry.name.startsWith("__next.")) {
      walk(path);
      continue;
    }
    for (const file of filesIn(path)) {
      renameSync(file, join(dir, `${entry.name}.${relative(path, file).split(sep).join(".")}`));
      moved++;
    }
    rmSync(path, { recursive: true });
  }
}

walk(out);
if (moved) console.log(`Moved ${moved} prefetch files to the paths the browser requests.`);
