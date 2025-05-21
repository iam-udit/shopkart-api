// eslint.config.js
// @ts-check

const eslint = require('@eslint/js');
const globals = require('globals');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier'); // This is important to disable conflicting rules

module.exports = [
    {
        ignores: [
            'node_modules/',
            'package-lock.json',
            'swagger.json',
            'api/documents/shopkart-docs.yaml',
            '.prettierrc.js', // Prettier's own config file
            'eslint.config.js', // ESLint's own config file
        ],
    },
    eslint.configs.recommended, // Base recommended rules
    {
        // Configuration for all JavaScript files
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs', // Or "module" if your project uses ES modules
            globals: {
                ...globals.node, // Common Node.js globals
            },
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            // Apply Prettier's rules. This will report Prettier problems as ESLint errors.
            // Make sure this is the last configuration in the extends array if you were using legacy config.
            // In flat config, the order of objects in the array matters. Rules from later objects can override earlier ones.
            ...eslintConfigPrettier.rules, // Turns off all rules that are unnecessary or might conflict with Prettier.
            'prettier/prettier': 'warn', // Enables the Prettier plugin and shows Prettier violations as warnings.

            // Custom rules from original .eslintrc.js
            'no-console': 'warn',
            'consistent-return': 'warn',

            // Example Node.js rules (can be added if eslint-plugin-node is configured for flat config)
            // 'node/no-exports-assign': 'error',
            // 'node/no-extraneous-require': 'error',
            // 'node/no-missing-require': 'error',
            // 'node/process-exit-as-throw': 'error',

            // Example Import plugin rules (can be added if eslint-plugin-import is configured for flat config)
            // 'import/no-unresolved': 'warn',
            // 'import/order': 'warn',
        },
    },
];
