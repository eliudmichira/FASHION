// Runs before `npm run build`. Two copies of @firebase/app make Firestore and
// Functions fail in the browser ("Service functions is not available"): the
// waitlist stops saving and checkout breaks. The override in package.json
// prevents that, but only once `npm install` has run after pulling.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const copies = [];
function look(dir) {
  const manifest = join(dir, "@firebase", "app", "package.json");
  if (existsSync(manifest)) copies.push(`${JSON.parse(readFileSync(manifest, "utf8")).version} in ${dir}`);
}

look("node_modules");
for (const name of readdirSync("node_modules")) {
  if (!name.startsWith("@")) look(join("node_modules", name, "node_modules"));
  else for (const sub of readdirSync(join("node_modules", name))) look(join("node_modules", name, sub, "node_modules"));
}

if (copies.length > 1) {
  console.error(`\nFound ${copies.length} copies of @firebase/app:\n  ${copies.join("\n  ")}`);
  console.error("Checkout and the waitlist break like this. Run `npm install`, then build again.\n");
  process.exit(1);
}
