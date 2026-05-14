import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: '',
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: '',
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: '3000',
        pathname: "/**"
      }
    ],
  },
};

export default nextConfig;
