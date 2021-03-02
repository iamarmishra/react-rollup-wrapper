import { uglify } from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';

const createRollupConfig = () => {
    const output = [
        {
            file: 'dist/dex.bundle.cjs.js',
            format: 'cjs',
            sourcemap: true
        },
        {
            file: 'dist/dex.bundle.es.js',
            format: 'es',
            sourcemap: true
        },
        {
            file: 'dist/dex.bundle.umd.js',
            format: 'umd',
            sourcemap: true,
            name: 'DexRollup',
            globals: {
                react: 'React'
            }
        }
    ];

    return {
        input: 'src/index.js',
        external: ['react', 'react-proptypes'],
        output: output,
        plugins: [
            uglify(),
            babel({
                exclude: 'node_modules/**'
            }),
            postcss({
                modules: true
            })
        ]
    };
};

export default [createRollupConfig()];
