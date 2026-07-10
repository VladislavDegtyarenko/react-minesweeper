import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/display-name': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'test-results/**',
      'tsconfig.tsbuildinfo',
    ],
  },
];

export default eslintConfig;
