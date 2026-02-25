const chaiseConfig = require('@isrd-isi-edu/chaise/eslint.config.js');

module.exports = [
  {
    ignores: [
      'docs/**/*',
      'boolean-search/**/*', 'heatmap/**/*', 'lineplot/**/*',
      'plot/**/*', 'treeview/**/*',
      'config/**/*',
      // legacy jQuery-based file, not a TS module — globals ($, ERMrest, etc.) are loaded externally
      'src/utils/legacy-treeview.js',
    ]
  },
  // inherit all rules from chaise, excluding its ignores block
  ...chaiseConfig.filter(c => !c.ignores),

  // TODO: fix the underlying code issues and remove these overrides.
  // Rules fall into two categories:
  //
  // 1. New react-hooks v7 rules (upgraded from v4) — real issues worth fixing:
  //    set-state-in-effect, refs, preserve-manual-memoization, static-components
  //
  // 2. eslint:recommended rules now included via chaise config (weren't in old .eslintrc.js extends):
  //    no-undef: turned off — TypeScript handles undefined variable checking.
  //    no-redeclare, no-prototype-builtins, no-irregular-whitespace: downgraded to warn.
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // react-hooks v7 — new rules, downgraded until code is fixed
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',

      // eslint:recommended — TypeScript handles undefined vars; turn off to avoid false positives
      'no-undef': 'off',

      // eslint:recommended — newly applied, downgraded until code is fixed
      'no-redeclare': 'warn',
      'no-prototype-builtins': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-case-declarations': 'warn',
      'no-fallthrough': 'warn',
      'no-useless-escape': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    }
  }
];
