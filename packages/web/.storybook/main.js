const path = require('path')

module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-next-router"
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5"
  },
  typescript: {
    reactDocgen: false
  },
  webpackFinal: async (config, { configType }) => {
    config.resolve.roots = [
      path.resolve(__dirname, '../public'),
      'node_modules',
    ];
  
    // Return the altered config
    return config;
  },
}
