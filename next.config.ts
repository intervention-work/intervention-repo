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
    // Duplicate pages -> canonical URLs
    { source: '/about-us', destination: '/about', permanent: true },
    { source: '/about-us/:path*', destination: '/about', permanent: true },
    { source: '/resources-3', destination: '/resources', permanent: true },
    // On Set Care Unit is a real service the menu links under /resources-3;
    // send it to its canonical service detail (keep this before the catch-all
    // /resources-3 rule below, which would otherwise swallow it into /resources).
    { source: '/resources-3/on-set-care-unit', destination: '/services/on-set-care-unit', permanent: true },
    { source: '/resources-3/:path*', destination: '/resources', permanent: true },
    { source: '/georgia', destination: '/interventionists-by-state/georgia', permanent: true },
    { source: '/intervention-help', destination: '/intervention', permanent: true },
    { source: '/intervention-help/:path*', destination: '/intervention', permanent: true },
    { source: '/free-resources', destination: '/resources', permanent: true },
  ],
};

export default nextConfig;
