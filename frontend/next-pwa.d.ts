declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  function withPWA(config: {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    fallbacks?: {
      document?: string;
    };
  }): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}

