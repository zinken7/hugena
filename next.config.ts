import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Policy for `next upgrade --agent` and the upgrade reminders shown by `next dev` and `next build`.
    agentUpgrade: 'security',
  },
};

export default nextConfig;
