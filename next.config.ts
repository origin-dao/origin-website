import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose deploy metadata to the client so the footer can show a
  // last-updated timestamp + commit sha. Populated by Vercel at build.
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
  },
  async redirects() {
    return [
      // ceremony.origindao.ai → origindao.ai/mint
      {
        source: "/:path*",
        has: [{ type: "host", value: "ceremony.origindao.ai" }],
        destination: "https://origindao.ai/mint",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
