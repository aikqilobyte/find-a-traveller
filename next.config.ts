import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Routes renamed when the three services collapsed into one
      // two-sided shipping marketplace.
      { source: "/available-space", destination: "/find-a-traveller", permanent: true },
      { source: "/ship-requests", destination: "/find-a-sender", permanent: true },
      { source: "/ship-requests/:path*", destination: "/find-a-sender/:path*", permanent: true },
      { source: "/travel-buddy", destination: "/find-a-traveller", permanent: true },
      { source: "/travel-buddy/:path*", destination: "/find-a-traveller", permanent: true },
      { source: "/dashboard/posts/new/luggage", destination: "/dashboard/posts/new/trip", permanent: true },
      { source: "/dashboard/posts/new/ship-request", destination: "/dashboard/posts/new/package", permanent: true },
      { source: "/dashboard/posts/new/travel-buddy", destination: "/dashboard/posts/new/trip", permanent: true },
    ];
  },
};

export default nextConfig;
