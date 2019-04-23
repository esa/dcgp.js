/* eslint-env node */
const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-object-rest-spread',
]

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
    }
  }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets:
            'last 2 version and > 0.2% in US and > 0.5%, not ie <= 11, not dead',
        },
      ],
    ],
    plugins,
  }
}
