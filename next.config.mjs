import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/en',
        destination: '/de',
        permanent: true,
      },
      {
        source: '/en/:path*',
        destination: '/de/:path*',
        permanent: true,
      },
      {
        source: '/fragen/:slug*',
        destination: '/de/fragen/:slug*',
        permanent: true,
      },
      {
        source: '/impressum',
        destination: '/de/impressum',
        permanent: true,
      },
      {
        source: '/datenschutz',
        destination: '/de/datenschutz',
        permanent: true,
      },
      {
        source: '/credits',
        destination: '/de/credits',
        permanent: true,
      },
      {
        source: '/generator',
        destination: '/de/generator',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
