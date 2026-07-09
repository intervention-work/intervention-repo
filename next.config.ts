import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'interventiodev.wpenginepowered.com' },
    ],
  },

  transpilePackages: [
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    'lenis',
    'motion',
  ],

  redirects: async () => [
    { source: '/v2', destination: '/', permanent: true },
    { source: '/resources/trainings', destination: '/resources', permanent: true },
    { source: '/resources/blog', destination: '/resources', permanent: true },
  ],
};

export default nextConfig;
