import { figma } from '@figmania/vite-plugin-figma'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  root: '.',
  base: './',
  server: { host: 'localhost', port: 8080 },
  build: {
    minify: false,
    outDir: 'build'
  },
  plugins: [react(), figma({
    editorType: ['figma'],
    name: 'SVG Toolkit',
    api: '1.0.0',
    id: '980340882594944725',
    main: 'src/main.ts'
  }), viteSingleFile()]
})
