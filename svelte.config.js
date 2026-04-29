import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			prerender: {
				default: true
			}
		}),
		paths: {
			base: '/MDOT-Guidehub'
		}
	}
};

export default config;