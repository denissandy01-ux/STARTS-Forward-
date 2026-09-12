import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve the callback hostname so Auth0 transaction cookies stay on the same host.
  skipMiddlewareUrlNormalize: true,
  // agent-core is a workspace package shipped as TypeScript source.
  transpilePackages: ["agent-core"],
};

export default nextConfig;
