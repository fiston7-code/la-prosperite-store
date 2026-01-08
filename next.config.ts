import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      // Si vous stockez aussi des images sur Supabase, ajoutez ceci :
      {
        protocol: 'https',
        hostname: 'your-project-id.supabase.co', // Remplacez par votre vrai host Supabase
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
