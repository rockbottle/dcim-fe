/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // Expose these to the browser (Sidebar) at runtime
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_MY_NODE_NAME: process.env.NEXT_PUBLIC_MY_NODE_NAME,
    NEXT_PUBLIC_MY_POD_NAME: process.env.NEXT_PUBLIC_MY_POD_NAME,
    BACKEND_URL: process.env.BACKEND_URL, // Expose for server-side use in API routes
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
