/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingExcludes: {
    '/': ['../2022/Telling_*', '../2018/Telling_*', '../2014/Telling_*'],
  },
};

export default nextConfig;
