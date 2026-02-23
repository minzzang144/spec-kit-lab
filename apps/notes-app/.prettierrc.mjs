/** @type {import("prettier").Config} */
export default {
  trailingComma: 'all',
  tabWidth: 4,
  useTabs: true,
  semi: true,
  singleQuote: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^react(.*)',
    '<THIRD_PARTY_MODULES>',

    '^#/App/(.*)',
    '^#/Pages/(.*)',
    '^#/Widgets/(.*)',
    '^#/Features/(.*)',
    '^#/Entities/(.*)',
    '^#/Shared/(.*)',

    '^../(?=.*)(?!$)',
    '^./(?=.*)(?!$)|^./?$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
