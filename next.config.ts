import type { NextConfig } from 'next';
const config:NextConfig={
 serverExternalPackages:['pg'],
 poweredByHeader:false,
 async headers(){return [{source:'/:path*',headers:[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'no-referrer'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"},
  {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'}
 ]}];}
};
export default config;
