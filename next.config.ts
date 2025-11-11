import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: [
      'ptwhyrlrfmpyhkwmljlu.supabase.co', // <-- Add your Supabase domain here
    ],
  },
};

export default nextConfig;
