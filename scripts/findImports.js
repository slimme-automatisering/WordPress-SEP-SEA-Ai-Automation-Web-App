import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findImports(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      findImports(filePath, fileList);
    } else if (filePath.endsWith(".js")) {
      const content = fs.readFileSync(filePath, "utf-8");

      // Zoek naar verschillende soorten imports
      const standardImports =
        content.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || [];
      const sideEffectImports = content.match(/import\s+['"](.*?)['"]/g) || [];
      const dynamicImports = content.match(/import\(['"](.*?)['"]\)/g) || [];

      const allImports = [
        ...standardImports,
        ...sideEffectImports,
        ...dynamicImports,
      ];

      if (allImports.length > 0) {
        const relativeFilePath = path.relative(
          path.join(__dirname, ".."),
          filePath,
        );
        fileList.push({
          file: relativeFilePath,
          imports: allImports.map((imp) => {
            // Extract the package/module name
            const match = imp.match(/['"]([^'"]+)['"]/);
            return match ? match[1] : imp;
          }),
        });
      }
    }
  });
  return fileList;
}

const srcPath = path.join(__dirname, "../src");
const imports = findImports(srcPath);

// Groepeer imports per package/module
const packageUsage = {};
imports.forEach(({ file, imports }) => {
  imports.forEach((imp) => {
    // Filter alleen externe packages (geen relatieve paden)
    if (!imp.startsWith(".") && !imp.startsWith("#")) {
      packageUsage[imp] = packageUsage[imp] || [];
      packageUsage[imp].push(file);
    }
  });
});

console.log("\nGebruikte externe packages/modules:");
console.log("=================================");
Object.entries(packageUsage).forEach(([pkg, files]) => {
  console.log(`\n${pkg}:`);
  files.forEach((file) => console.log(`  - ${file}`));
});

console.log("\nGedetailleerde import informatie per bestand:");
console.log("=========================================");
imports.forEach(({ file, imports }) => {
  console.log(`\n${file}:`);
  imports.forEach((imp) => console.log(`  - ${imp}`));
});
