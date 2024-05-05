module.exports = {
  
  webpack: (config, { isServer }) => {
      
      // If client-side, don't polyfill `fs`
      if (!isServer) {
      config.resolve.fallback = {
          fs: false,
      };
      }

      return config;
  },
  
};