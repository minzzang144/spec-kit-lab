/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/shared-utils', '@repo/shared-types'],
  experimental: {
    turbo: {
      resolveAlias: {
        '@/*': './src/*',
        '@repo/*': '../../packages/*/src',
      },
    },
  },
};

module.exports = nextConfig;