if (process.env.OPENNEXT_ENABLE_CLOUDFLARE_DEV === "true") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare")
  initOpenNextCloudflareForDev()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Domaine canonique unique pour le référencement : www.leguideia.ai → leguideia.ai
      // (/api exclu pour ne pas casser les webhooks de paiement déjà configurés sur www)
      {
        source: '/:path((?!api/).*)',
        has: [{ type: 'host', value: 'www.leguideia.ai' }],
        destination: 'https://leguideia.ai/:path',
        permanent: true,
      },
      {
        source: '/pricing',
        destination: '/tarifs',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
