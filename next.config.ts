/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_MY_NODE_NAME: process.env.NEXT_PUBLIC_MY_NODE_NAME,
    NEXT_PUBLIC_MY_POD_NAME: process.env.NEXT_PUBLIC_MY_POD_NAME,
    BACKEND_URL: process.env.BACKEND_URL, // This is key for the route handler
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
