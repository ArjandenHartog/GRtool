/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    return config;
  },
  turbopack: {},
};

export default nextConfig;
