import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import babel from 'vite-plugin-babel'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { glob } from 'glob'
import babelRollup from '@rollup/plugin-babel'

function getPages() {
    const entries = {}
    glob.sync('./src/pages/**/index.html').forEach(file => {
        const name = file.split('/').slice(-2, -1)[0]
        entries[name] = path.resolve(__dirname, file)
    })
    return entries
}

const DARK_MODE_CRITICAL_CSS = `<style>@media (prefers-color-scheme: dark){html,body{background-color:#121212;color:#fcfcfc;color-scheme:dark}}</style>`
const DARK_MODE_CRITICAL_SCRIPT = `<script>(function(){if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.style.backgroundColor="#121212";document.documentElement.style.colorScheme="dark";document.addEventListener("DOMContentLoaded",function(){document.body&&document.body.setAttribute("dark-mode","true")})}})();<\/script>`

function injectDarkModeCriticalAssets() {
    return {
        name: 'inject-dark-mode-critical-assets',
        transformIndexHtml(html) {
            return html.replace('<head>', `<head>\n        ${DARK_MODE_CRITICAL_CSS}\n        ${DARK_MODE_CRITICAL_SCRIPT}`)
        }
    }
}

export default defineConfig({
    plugins: [
        injectDarkModeCriticalAssets(),
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
            additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            modernPolyfills: true
        })
    ],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    build: {
        rollupOptions: {
            input: getPages(),
            plugins: [
                babelRollup({
                    include: ['node_modules/**', 'src/**/*'],
                    babelHelpers: 'bundled',
                    extensions: ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue'],
                    babelrc: false,
                    configFile: false,
                    plugins: [
                        ['@babel/plugin-transform-unicode-property-regex', { useUnicodeFlag: false }]
                    ]
                })
            ]
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log']
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
