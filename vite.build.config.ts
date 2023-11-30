import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	publicDir: false,
	build: {
		emptyOutDir: true,
		lib: {
			entry: new URL('src/index.ts', import.meta.url).pathname,
			name: '@sa-net/web-components',
			formats: ['es'],
		},
	},

	plugins: [
		dts({
			rollupTypes: true,
		}),
	],
})
