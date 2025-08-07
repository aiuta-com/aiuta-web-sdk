module.exports = {
  devIndicators: false,
  reactStrictMode: true,
  images: {
    domains: ["storage.googleapis.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        ],
      },
    ];
  },
};
