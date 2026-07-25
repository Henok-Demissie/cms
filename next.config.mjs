/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: './',
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
