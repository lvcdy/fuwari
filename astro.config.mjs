import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders, svgoOptimizer } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import path from "path";
import { fileURLToPath } from "url";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig, umamiConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getOrigin(value) {
	try {
		return value ? new URL(value).origin : undefined;
	} catch {
		return undefined;
	}
}

const umamiOrigin = getOrigin(umamiConfig.baseUrl);

// https://astro.build/config
export default defineConfig({
	site: "https://blog.lvcdy.cn",
	base: "/",
	trailingSlash: "always",
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				"base-uri 'self'",
				"object-src 'none'",
				"frame-ancestors 'self'",
				"form-action 'self'",
				"img-src 'self' data: blob: https:",
				"font-src 'self' data:",
				`connect-src 'self'${umamiOrigin ? ` ${umamiOrigin}` : ""}`,
			],
			scriptDirective: {
				resources: ["'self'", ...(umamiOrigin ? [umamiOrigin] : [])],
			},
			styleDirective: {
				resources: ["'self'"],
			},
		},
	},
	// 性能优化：使用 Astro 6.2 的 JSX 空白压缩规则，保持 .astro 和 JSX 输出一致
	compressHTML: "jsx",
	devToolbar: {
		placement: "bottom-left",
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Roboto",
			cssVariable: "--font-roboto",
			weights: [400, 500, 700],
			styles: ["normal"],
			fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "JetBrains Mono",
			cssVariable: "--font-jetbrains-mono",
			weights: ["100 800"],
			styles: ["normal", "italic"],
			fallbacks: ["ui-monospace", "monospace"],
		},
	],
	experimental: {
		queuedRendering: {
			enabled: true,
		},
		svgOptimizer: svgoOptimizer({
			plugins: [
				{
					name: "preset-default",
					params: {
						overrides: {
							removeViewBox: false,
						},
					},
				},
			],
		}),
	},
	// 性能优化：优化图像处理
	image: {
		service: {
			entrypoint: "astro/assets/services/sharp",
			config: {
				kernel: "mks2021",
				jpeg: {
					mozjpeg: true,
					progressive: true,
				},
				webp: {
					effort: 6,
					alphaQuality: 80,
				},
				avif: {
					effort: 4,
					chromaSubsampling: "4:2:0",
				},
				png: {
					compressionLevel: 9,
				},
			},
		},
	},
	integrations: [
		icon({
			include: {
				"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
			},
		}),
		expressiveCode({
			themes: [expressiveCodeConfig.theme],
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
					editorTabBarBackground: "var(--codeblock-topbar-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
					terminalTitlebarBorderBottomColor: "none",
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
			},
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		svelte(),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkReadingTime,
			remarkExcerpt,
			remarkGithubAdmonitionsToDirectives,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
		],
		rehypePlugins: [
			rehypeKatex,
			rehypeSlug,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) => AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [
							{
								type: "text",
								value: "#",
							},
						],
					},
				},
			],
		],
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			// 性能优化：减少 Chunk 大小
			minify: "terser",
			terserOptions: {
				compress: {
					drop_console: true, // 生产环境删除 console
				},
			},
			rollupOptions: {
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
		},
		ssr: {
			external: ["sharp"],
		},
		// 路径别名配置
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				"@components": path.resolve(__dirname, "./src/components"),
				"@assets": path.resolve(__dirname, "./src/assets"),
				"@constants": path.resolve(__dirname, "./src/constants"),
				"@utils": path.resolve(__dirname, "./src/utils"),
				"@i18n": path.resolve(__dirname, "./src/i18n"),
				"@layouts": path.resolve(__dirname, "./src/layouts"),
			},
		},
	},
});
