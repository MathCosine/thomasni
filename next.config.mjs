// Static export for GitHub Pages.
// In CI, the Pages workflow sets PAGES_BASE_PATH to "/<repo>" (e.g. "/thomasni")
// so assets resolve under the project-site subpath. Locally it is empty.
const basePath = process.env.PAGES_BASE_PATH && process.env.PAGES_BASE_PATH !== "/"
  ? process.env.PAGES_BASE_PATH
  : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
