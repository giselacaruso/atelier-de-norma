import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Las fotos ya llegan comprimidas (~200 KB), pero dejamos margen.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
