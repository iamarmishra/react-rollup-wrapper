import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
import glob from 'glob';
import requireContext from 'rollup-plugin-require-context';
const { browserslist } = require('./package.json');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const { uglify } = require('rollup-plugin-uglify');
import react from 'react';
import reactDom from 'react-dom';
import replacePlugin from '@rollup/plugin-replace';

import pkg from './package.json';

const makeExternalPredicate = externalsArr => {
    if (externalsArr.length === 0) {
        return () => false;
    }

    const externalPattern = new RegExp(`^(${externalsArr.join('|')})($|/)`);

    return id => externalPattern.test(id);
};

const babelConfig = {
    exclude: 'node_modules/**',
    presets: ['@babel/preset-flow'],
    plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
        'react-flow-props-to-prop-types'
    ]
};

const reactNamedExport = {
    namedExports: {
        react: Object.keys(react),
        'react-dom': Object.keys(reactDom)
    }
};

const commonPlugins = [
    resolve(),
    commonjs({ include: 'node_modules/**', ...reactNamedExport }),
    json()
];

require('dotenv').config();

const umd_config = {
    output: {
        file: pkg.browser,
        format: 'umd',
        name: 'GlassCore',
        sourcemap: 'inline',
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-redux': 'ReactRedux',
            '@informatica/droplets-core': 'droplets',
            'react-router-dom': 'ReactRouterDOM',
            'semantic-ui-react': 'semanticUIReact',
            highcharts: 'Highcharts',
            'highcharts-react-official': 'HighchartsReact',
            'highcharts/modules/map': 'HC_map',
            'lru-cache': 'lru-cache'
        }
    }
};

const createComponentBuild = input => ({
    ...addExternalPlugins(
        createBrowserRollup(pkg, {
            ...umd_config,
            output: {
                ...umd_config.output,
                file: `dist/components/${input.split('/').pop()}`,
                name: `GlassCore${input
                    .split('/')
                    .pop()
                    .replace('.js', '')}`
            }
        })
    ),
    input
});

const addExternalPlugins = config => {
    if (config.plugins) {
        config.plugins.push(
            postcss({
                // this is needed to compile all the CSS files
                modules: true
            }),
            svg({
                base64: true
            }),
            requireContext()
        );
    }
    return config;
};

const createNodeRollup = pkg => {
    const output = [];

    if (pkg.main) {
        output.push({
            file: pkg.main,
            format: 'cjs',
            sourcemap: 'inline'
        });
    }

    if (pkg.module) {
        output.push({
            file: pkg.module,
            format: 'es',
            sourcemap: 'inline'
        });
    }

    return {
        input: 'src/index.js',
        external: makeExternalPredicate(Object.keys(pkg.peerDependencies || {})),
        output,
        plugins: [
            babel({
                ...babelConfig,
                presets: [['@babel/preset-react', { development: true }], ...babelConfig.presets]
            }),
            ...commonPlugins
        ]
    };
};

const createBrowserRollup = (pkg, { output } = {}) => ({
    input: 'src/index.js',
    external: makeExternalPredicate(Object.keys(pkg.peerDependencies || {})),
    output: {
        file: pkg.browser,
        format: 'umd',
        ...output
    },
    plugins: [
        replacePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        babel({
            ...babelConfig,
            runtimeHelpers: true,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        forceAllTransforms: true,
                        targets: { browsers: pkg.browserslist || browserslist }
                    }
                ],
                ['@babel/preset-react', { development: false }],
                ...babelConfig.presets
            ],
            plugins: ['@babel/transform-runtime', ...babelConfig.plugins]
        }),
        ...commonPlugins,
        replace({
            'process.env.NODE_ENV': process.env.NODE_ENV || "'production'"
        }),
        uglify()
    ]
});

module.exports = [
    addExternalPlugins(createNodeRollup(pkg)),
    addExternalPlugins(createBrowserRollup(pkg, umd_config)),

    // this will export component files too
    // update this path when we add components & libs too
    ...glob
        .sync('./src/components/**/*.js', {
            ignore: './src/**/*.test.js' // './src/**/__tests__/*.js'
        })
        .map(createComponentBuild)
];
