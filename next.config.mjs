/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg'],
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;

