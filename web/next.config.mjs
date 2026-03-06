/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    return config;
  },
  turbopack: {},
  outputFileTracingIncludes: {
    '/*': ['../2022/*.xml', '../2018/*.xml', '../2014/*.xml']
  }
};

export default nextConfig;
