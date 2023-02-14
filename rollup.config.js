//@ts-check

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import astMacros from "rollup-plugin-ast-macros";
import { uglify } from "rollup-plugin-uglify";


// import { minify } from "terser";
// import { minify } from "uglify-js";

import fs from "fs";
import path from 'path';



const buildOptions = {
    input: './index.js',
    // input: './lib/plugin.js',
    output: [
        {
            file: './build/less2sass.js',
            format: 'iife',
            name: "sassCompiler",
        },
        // {
        //     file: './build/sass2less.mjs',
        //     format: 'es',
        //     name: "LessCompiler",
        // },
        // {
        //     file: './build/sass2less.cjs',
        //     format: 'cjs',
        //     name: "LessCompiler",
        // },
    ],
    plugins: [
        // astMacros(),
        // calculableMacros({
        //     prettify: true,
        //     comments: false,
        //     verbose: true,
        //     externalPackages: {path, fs},            
        //     macroses: {
        //         import: (function (_path) {
        //             console.log(_path);
        //             let code = fs.readFileSync(_path).toString()

        //             let flatCode = code.replace('module.exports = ', '')

        //             let hasCLosingComma = flatCode.trim().slice(-1) === ';'
        //             if (hasCLosingComma) {
        //                 flatCode = flatCode.trim().slice(0, -1)
        //             }
        //             return flatCode
        //         }).toString(),                
        //         __dirname: '`${path.dirname(path.relative(process.cwd(), file))}`',
        //         "let fs = require('fs')": ''
        //     },
        //     onReplace: (v) => `return [${v}]`,
        // }),
        resolve({
            browser: true
        }),
        commonjs(),
        // uglify()

        // typescript({
        //     // module: 'CommonJS', 
        //     // tsconfig: false, 
        //     lib: ["es6", "dom"], //es5
        //     target: "es5",
        //     sourceMap: true
        // }),
    ]
};





// const pluginBuildOptions = {

//     input: './lib/plugin.js',
//     output: buildOptions.output.map(_output => {
//         _output.file = _output.file.replace('/build/', '/build/plugin/')
//         return _output
//     }),
//     ...buildOptions,
// }

const sassBuildOptions = {
    ...buildOptions,
    input: './lib/sass.js',
    output: { ...buildOptions.output[0], file: './build/sass.js' }
}


if (!~process.argv.indexOf('-c')) {

    let buildOptions = sassBuildOptions;

    import("rollup").then(function ({ rollup }) {

        //@ts-ignore
        rollup(buildOptions).then(bundle => {
            // console.log(bundle);
            if (Array.isArray(buildOptions.output)) buildOptions.output.forEach(_output => {

                //@ts-ignore
                bundle.generate(_output).then(function ({ output }) {
                    // console.log(output);                

                    fs.writeFileSync(_output.file, output[0].code)
                })
            })
            else {
                //@ts-ignore
                bundle.generate(buildOptions.output).then(function ({ output }) {
                    // console.log(output);                

                    //@ts-ignore
                    fs.writeFileSync(buildOptions.output.file, output[0].code)
                })
            }

        }).catch(er => {
            console.warn(er);
        })
    })
}

export default buildOptions;