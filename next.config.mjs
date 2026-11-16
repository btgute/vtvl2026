/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', '@prisma/client'],
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;

