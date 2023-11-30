import { defineConfig } from 'vite'

export default defineConfig({
	resolve: {
		alias: {
			'@sa-net/web-components': new URL('src/index.ts', import.meta.url)
				.pathname,
		},
	},
})
