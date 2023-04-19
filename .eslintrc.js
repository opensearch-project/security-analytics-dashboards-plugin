module.exports = {
  root: true,
  extends: ['@elastic/eslint-config-kibana', 'plugin:@elastic/eui/recommended'],
  settings: {
    'import/resolver': {
      '@elastic/eslint-import-resolver-kibana': {
        rootPackageName: 'opensearch_security_analytics_dashboards',
        pluginPaths: ['.'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.{js,ts,tsx}'],
      rules: {
        'no-console': 0,
        'react-native/no-raw-text': 'off',
      },
    },
  ],
};
