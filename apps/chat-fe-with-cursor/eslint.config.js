import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.config.js', '*.config.ts'] },
  ...tseslint.configs.recommended
);
