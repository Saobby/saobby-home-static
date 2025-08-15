// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import babel from 'vite-plugin-babel'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { glob } from 'glob'

function getPages() {
    const entries = {}
    glob.sync('./src/pages/**/index.html').forEach(file => {
        const name = file.split('/').slice(-2, -1)[0]
        entries[name] = path.resolve(__dirname, file)
    })
    return entries
}

export default defineConfig({
    plugins: [
        vue(),
        babel({
            babelConfig: {
                babelrc: true
            }
        }),
        legacy({
            targets: [
                'chrome >= 49',
                'firefox >= 50', 
                'safari >= 11',
                'edge >= 79',
                'opera >= 36'
            ],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime']
        })
    ],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    build: {
        rollupOptions: {
            input: getPages()
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log'],
                unsafe: true,
                unsafe_comps: true,
                unsafe_math: false,
                unsafe_Function: false,
                unsafe_proto: false,
                unsafe_regexp: true
            },
            mangle: {
                toplevel: true,
                eval: true,
                keep_fnames: false,
                reserved: []
            },
            format: {
                comments: false
            }
        }
    }
})
