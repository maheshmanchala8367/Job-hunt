/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  typescript: {
    // Type errors are caught by `tsc --noEmit` locally before every push.
    // Disabling here prevents Vercel's type-checker from OOMing on
    // @react-pdf/renderer's complex generic types in CI.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint is run locally via `next lint` before every push.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
