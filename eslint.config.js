/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.git/**',
      '.specify/**',
      'specs/**',
      '**/*.min.js',
    ],
  },
];
