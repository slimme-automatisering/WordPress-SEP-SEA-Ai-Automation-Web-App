#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import { builtinModules } from "module";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuratie
const CONFIG = {
  // Directories om te negeren
  ignoreDirectories: [
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    ".git/**",
  ],
  // Bekende development dependencies die vaak ongebruikt lijken
  knownDevDeps: new Set([
    "jest",
    "eslint",
    "nodemon",
    "typescript",
    "@types/*",
    "prettier",
    "supertest",
    "mocha",
    "chai",
    "nyc",
    "ts-node",
    "webpack",
    "babel-*",
  ]),
  // Node.js interne modules (niet rapporteren als ontbrekend)
  internalModules: new Set([
    ...builtinModules,
    ...builtinModules.map((mod) => `node:${mod}`),
  ]),
  // Bekende peer dependencies die vaak indirect gebruikt worden
  knownPeerDeps: new Set([
    "react",
    "react-dom",
    "@types/react",
    "@types/react-dom",
    "@emotion/react",
    "@emotion/styled",
  ]),
};

// Functie om package versies te vergelijken
function compareVersions(v1, v2) {
  const normalize = (v) => v.replace(/^[\^~]/, "");
  const parts1 = normalize(v1).split(".");
  const parts2 = normalize(v2).split(".");

  for (let i = 0; i < 3; i++) {
    const num1 = parseInt(parts1[i] || 0);
    const num2 = parseInt(parts2[i] || 0);
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// Functie om security vulnerabilities te checken via npm audit
async function checkSecurity(packagePath) {
  try {
    const output = execSync("npm audit --json", {
      cwd: path.dirname(packagePath),
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(output.toString());
  } catch (error) {
    // npm audit returnt een error als er vulnerabilities zijn
    try {
      return JSON.parse(error.output?.[1]?.toString() || "{}");
    } catch {
      return { error: "Kon npm audit niet uitvoeren" };
    }
  }
}

// Functie om imports uit een bestand te extraheren
function extractImports(content) {
  const imports = new Set();
  const dynamicImports = new Set();

  // Match verschillende import patronen
  const patterns = [
    {
      regex: /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      isDynamic: true,
    },
    {
      regex: /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,
      isDynamic: false,
    },
    {
      regex: /import\s+['"]([^'"]+)['"]/g,
      isDynamic: false,
    },
    {
      regex: /require\s*\(['"]([^'"]+)['"]\)/g,
      isDynamic: false,
    },
  ];

  patterns.forEach(({ regex, isDynamic }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const packageName = match[1].split("/")[0];
      if (
        !packageName.startsWith(".") &&
        !CONFIG.internalModules.has(packageName)
      ) {
        if (isDynamic) {
          dynamicImports.add(packageName);
        } else {
          imports.add(packageName);
        }
      }
    }
  });

  return {
    imports: Array.from(imports),
    dynamicImports: Array.from(dynamicImports),
  };
}

// Functie om package.json dependencies te controleren
async function checkDependencies(projectRoot, packageJsonPath) {
  console.log(
    `\n🔍 Controleren van dependencies in ${path.relative(projectRoot, packageJsonPath)}...\n`,
  );

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const declaredDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ]);

  const depVersions = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Bepaal de directory waarin we moeten zoeken
  const searchDir = path.dirname(packageJsonPath);

  // Zoek alle JavaScript/TypeScript bestanden
  const files = glob.sync("**/*.{js,jsx,ts,tsx}", {
    cwd: searchDir,
    ignore: CONFIG.ignoreDirectories,
  });

  // Verzamel alle imports
  const foundImports = new Set();
  const dynamicImports = new Set();
  const fileImports = new Map(); // Voor het traceren van welk bestand welke imports gebruikt

  files.forEach((file) => {
    const fullPath = path.join(searchDir, file);
    try {
      const content = fs.readFileSync(fullPath, "utf8");
      const { imports, dynamicImports: dynImports } = extractImports(content);

      imports.forEach((imp) => {
        foundImports.add(imp);
        if (!fileImports.has(imp)) {
          fileImports.set(imp, new Set());
        }
        fileImports.get(imp).add(file);
      });

      dynImports.forEach((imp) => {
        dynamicImports.add(imp);
        foundImports.add(imp);
      });
    } catch (error) {
      console.error(`⚠️  Kon bestand niet lezen: ${file}`);
    }
  });

  // Security check
  console.log("🔒 Controleren op security vulnerabilities...");
  const securityReport = await checkSecurity(packageJsonPath);
  if (securityReport.vulnerabilities) {
    console.log("\n⚠️  Security vulnerabilities gevonden:");
    for (const [severity, vulns] of Object.entries(
      securityReport.vulnerabilities,
    )) {
      console.log(`${severity}: ${vulns.length} kwetsbaarheden`);
    }
  } else {
    console.log("✅ Geen security vulnerabilities gevonden");
  }

  // Vergelijk en rapporteer
  console.log("\n📦 Dependencies analyse:");

  // 1. Ontbrekende dependencies
  const missing = Array.from(foundImports).filter(
    (imp) => !declaredDeps.has(imp),
  );
  if (missing.length === 0) {
    console.log("✅ Alle dependencies zijn correct gedeclareerd!");
  } else {
    console.log("\n❌ Ontbrekende dependencies:");
    missing.forEach((dep) => {
      const files = fileImports.get(dep);
      console.log(
        `- ${dep} (gebruikt in: ${Array.from(files || []).join(", ")})`,
      );
    });
    console.log("\n💡 Installatie commando:");
    console.log(`cd "${searchDir}" && npm install ${missing.join(" ")}`);
  }

  // 2. Ongebruikte dependencies
  const unused = Array.from(declaredDeps).filter(
    (dep) => !foundImports.has(dep),
  );
  const unusedDev = unused.filter(
    (dep) =>
      CONFIG.knownDevDeps.has(dep) ||
      Array.from(CONFIG.knownDevDeps).some(
        (pattern) =>
          pattern.endsWith("*") && dep.startsWith(pattern.slice(0, -1)),
      ),
  );
  const unusedPeer = unused.filter((dep) => CONFIG.knownPeerDeps.has(dep));
  const reallyUnused = unused.filter(
    (dep) => !unusedDev.includes(dep) && !unusedPeer.includes(dep),
  );

  if (unused.length > 0) {
    console.log("\n🧹 Ongebruikte dependencies:");
    if (reallyUnused.length > 0) {
      console.log("\nMogelijk echt ongebruikt:");
      reallyUnused.forEach((dep) => console.log(`❌ ${dep}`));
    }
    if (unusedDev.length > 0) {
      console.log("\nDevelopment dependencies (waarschijnlijk OK):");
      unusedDev.forEach((dep) => console.log(`ℹ️  ${dep}`));
    }
    if (unusedPeer.length > 0) {
      console.log("\nPeer dependencies (waarschijnlijk OK):");
      unusedPeer.forEach((dep) => console.log(`ℹ️  ${dep}`));
    }
  }

  // 3. Dynamische imports
  if (dynamicImports.size > 0) {
    console.log("\n🔄 Dynamische imports gevonden:");
    dynamicImports.forEach((imp) => console.log(`- ${imp}`));
    console.log(
      "\nLet op: Deze imports kunnen runtime failures veroorzaken als de packages ontbreken!",
    );
  }

  return {
    total: declaredDeps.size,
    missing: missing.length,
    unused: unused.length,
    used: declaredDeps.size - unused.length,
    vulnerabilities: securityReport.vulnerabilities || {},
    versions: depVersions,
  };
}

// Start de check voor de API app
const apiPath = path.join(__dirname, "..", "src", "api", "package.json");
console.log("🚀 Checking API dependencies...\n");

checkDependencies(path.join(__dirname, ".."), apiPath).catch(console.error);
