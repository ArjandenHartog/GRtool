/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    return config;
  },
  turbopack: {},
  outputFileTracingIncludes: {
    '/*': ['./data/2022/*.xml', './data/2018/*.xml', './data/2014/*.xml'],
    '/': ['./data/2022/*.xml', './data/2018/*.xml', './data/2014/*.xml']
  }
};

export default nextConfig;
