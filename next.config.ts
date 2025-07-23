import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config: any, options: any) => {
    console.log(options.webpack.version); // Should be webpack v5 now
    config.experiments = {
      layers: true, // Enable experiments.layers to fix the error
    };
    config.target = 'node'; // Add the target: 'node' here
    return config;
  },
};

export default nextConfig;

