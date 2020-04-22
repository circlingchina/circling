module.exports = {
    "gifsicle": { "optimizationLevel": 2, "interlaced": false, "colors": 10 },
    "mozjpeg": { "progressive": true, "quality": 90 },
    "pngquant": { "quality": [0.95, 1], "speed": 1, "folyd": 1 },
    "svgo": {
      "plugins": [
        { "removeViewBox": false },
        { "cleanupIDs": true },
      ]
    },
    "webp": { "quality": 10 }
  };
