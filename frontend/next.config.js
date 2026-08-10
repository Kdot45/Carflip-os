/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep Next's dev-mode indicator out of the way of the project page's
  // sticky bottom action bar, which also lives in the bottom corner.
  devIndicators: {
    position: "top-right",
  },
};

module.exports = nextConfig;
