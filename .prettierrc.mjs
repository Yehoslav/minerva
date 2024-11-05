/** @type {import("prettier").Config} */
export default {
    semi: true,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: false,
    singleQuote: true,
    tabWidth: 4,
    experimentalTernaries: true,

    plugins: ['prettier-plugin-astro'],
    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
};
