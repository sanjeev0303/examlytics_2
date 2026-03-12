import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve AVIF/WebP automatically — smaller transfers with zero code change
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    // Tree-shake barrel imports: only bundle icons/components actually used
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "recharts",
      "date-fns",
      "sonner",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
    ],
  },
};

export default nextConfig;
