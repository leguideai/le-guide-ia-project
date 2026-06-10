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
}

export default nextConfig
