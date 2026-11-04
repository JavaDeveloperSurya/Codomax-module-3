/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow the Arena live-preview proxy host in Next.js dev mode.
  allowedDevOrigins: ['*.e2b.app', 'localhost', '127.0.0.1'],
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ['mongoose']
};

export default nextConfig;
