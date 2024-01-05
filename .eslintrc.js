module.exports = {
    'parserOptions': {
        'ecmaVersion': 11
    },
    'env': {
        'browser': true,
        'es6': true
    },
    'extends': [
        'eslint:recommended',
    ],
    'rules': {
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'no-multiple-empty-lines': ['error', { 'max': 1 }],
        'indent': ['error', 4],
    },
    'ignorePatterns': [
        'app/simplicite.min.js*'
    ]
};
