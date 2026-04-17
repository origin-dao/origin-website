import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
