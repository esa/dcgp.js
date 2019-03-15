/* eslint-env node */
const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-object-rest-spread',
];

module.exports = api => {
  if (api.env('test')) {
    return {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins,
    };
  }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          exclude: ['transform-async-to-generator', 'transform-regenerator'],
          modules: false,
          loose: true,
        },
      ],
    ],
    plugins,
  };
};
