module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
        },
      ],
      // Reanimated and Worklets are now handled automatically by the preset above!
    ],
  };
};