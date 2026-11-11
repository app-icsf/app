/** @type {import('next').NextConfig} */
const nextConfig = { images: { unoptimized: true }, transpilePackages: ["react-leaflet", "leaflet", "@capacitor/core", "@capacitor/geolocation", "@capacitor/local-notifications", "@capacitor/filesystem", "@capacitor/app"] };
export default nextConfig;
