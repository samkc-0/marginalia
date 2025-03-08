import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: { turbo: { resolveAlias: { canvas: './empty-canvas.ts' } } },
}

export default nextConfig
