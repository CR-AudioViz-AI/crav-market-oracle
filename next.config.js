// Build trigger: 1779135724
/** @type {import("next").NextConfig} */
const nextConfig={
  // 2026-08-29: required for @craudioviz/platform-sdk. The SDK ships raw
  // TypeScript and Next does not run node_modules through SWC by default, so
  // any import carrying a `type` re-export fails the build without this.
  transpilePackages: ["@craudioviz/platform-sdk"],typescript:{ignoreBuildErrors:true},eslint:{ignoreDuringBuilds:true},reactStrictMode:false}
module.exports=nextConfig
