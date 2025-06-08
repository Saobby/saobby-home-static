// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
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
    plugins: [vue()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    build: {
        rollupOptions: {
            input: getPages()
        }
    }
})
