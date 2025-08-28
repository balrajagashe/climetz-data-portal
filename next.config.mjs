/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://4e9e371b-2851-4fe8-9ab8-0db7f3eb7b30-00-3gt5zppbl5i2s.pike.replit.dev"
  ]
};

export default nextConfig;
