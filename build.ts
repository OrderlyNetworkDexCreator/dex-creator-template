import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";

const STATIC_ROUTES = [
  "/perp",
  "/markets",
  "/portfolio",
  "/portfolio/positions",
  "/portfolio/orders",
  "/portfolio/fee",
  "/portfolio/api-key",
  "/portfolio/setting",
  "/leaderboard",
  "/swap",
];

interface SymbolInfo {
  symbol: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    rows: SymbolInfo[];
  };
}

async function fetchSymbols(): Promise<string[]> {
  try {
    const response = await fetch("https://api.orderly.org/v1/public/info");
    const data = (await response.json()) as ApiResponse;
    return data.data.rows.map((row) => row.symbol);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    return [];
  }
}

async function copyIndexToPath(indexPath: string, targetPath: string) {
  try {
    // Create parent directory if it doesn't exist
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(indexPath, targetPath);
    console.log(`Created: ${targetPath}`);
  } catch (error) {
    console.error(`Error copying to ${targetPath}:`, error);
  }
}

async function clearDirectory(dir: string) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
    await fs.mkdir(dir, { recursive: true });
    console.log(`Cleared directory: ${dir}`);
  } catch (error) {
    console.error(`Error clearing directory ${dir}:`, error);
  }
}

async function main() {
  const buildDir = "./dist";

  // Get the base path from environment variable or default to '/'
  const basePath = process.env.PUBLIC_PATH || "/";
  console.log(`Using base path: ${basePath}`);

  // Step 1: Clear build directory
  console.log("Clearing build directory...");
  await clearDirectory(buildDir);

  // Step 2: Run the regular build
  console.log("\nRunning regular build...");
  execSync("yarn build", { stdio: "inherit" });

  const indexPath = path.join(buildDir, "index.html");

  // Step 3: Create HTML files for static routes
  console.log("\nCreating static route files...");
  for (const route of STATIC_ROUTES) {
    const targetPath = path.join(buildDir, route, "index.html");
    await copyIndexToPath(indexPath, targetPath);
  }

  // Step 4: Fetch symbols and create perp route files
  console.log("\nFetching symbols and creating perp route files...");
  const symbols = await fetchSymbols();
  console.log(symbols);

  for (const symbol of symbols) {
    const targetPath = path.join(buildDir, "perp", symbol, "index.html");
    await copyIndexToPath(indexPath, targetPath);
  }

  // Step 5: Create 404.html for GitHub Pages fallback routing
  console.log("\nCreating 404.html for GitHub Pages fallback...");
  const fallbackPath = path.join(buildDir, "404.html");
  await copyIndexToPath(indexPath, fallbackPath);

  console.log("\nBuild completed successfully!");
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
