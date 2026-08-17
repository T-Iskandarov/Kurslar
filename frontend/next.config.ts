import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.kurslarim.uz',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api.kurslarim.uz',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '169.58.49.5',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: true,
  },
  output: 'standalone',
};

export default nextConfig;
