import type {
	BackgroundConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	TextColorConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import { UMAMI_SHARE_URL } from "./constants/constants";

const UMAMI_AUTH_TOKEN = import.meta.env.UMAMI_AUTH_TOKEN ?? "";
const UMAMI_BASE_URL = import.meta.env.UMAMI_BASE_URL ?? "https://umami.lvcdy.cn";
const UMAMI_WEBSITE_ID = import.meta.env.UMAMI_WEBSITE_ID ?? "cffa7f37-d0b7-4c37-90a6-8569946f871b";

export const siteConfig: SiteConfig = {
	title: "Fuwari",
	subtitle: "糖的小破站",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh-CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "状态",
			url: "https://status.lvcdy.cn", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
		...(UMAMI_SHARE_URL
			? [
				{
					name: "统计",
					url: UMAMI_SHARE_URL,
					external: true,
				},
			]
			: []),
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/headphoto.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "与众不同的糖",
	bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	links: [
		{
			name: "哔哩哔哩",
			icon: "fa6-brands:bilibili", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://space.bilibili.com/284464095",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/saicaca/fuwari",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

export const umamiConfig: UmamiConfig = {
	baseUrl: UMAMI_BASE_URL,
	websiteId: UMAMI_WEBSITE_ID,
	timezone: "Asia/Shanghai",
	// Only used to check if token is configured, actual value read via getSecret() at runtime
	authToken: UMAMI_AUTH_TOKEN ? "***" : "",
};

// Text color adaptive configuration
export const textColorConfig: TextColorConfig = {
	// Enable automatic text color adjustment based on background brightness
	enableAutoDetect: true,
	// Light mode text color (used for bright backgrounds)
	lightModeTextColor: "rgb(30, 30, 30)",
	// Dark mode text color (used for dark backgrounds)
	darkModeTextColor: "rgb(245, 245, 245)",
	// Brightness threshold (0-255)
	threshold: 128,
};

// Background image configuration
export const backgroundConfig: BackgroundConfig = {
	type: "remote",
	src: "https://t.alcy.cc/ycy",
};
