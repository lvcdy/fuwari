/**
 * Detect background brightness and adjust text color accordingly
 */

import type { TextColorConfig } from "@/types/config";

export const defaultColorConfig: TextColorConfig = {
	lightModeTextColor: "rgb(30, 30, 30)", // 深色文字（用于亮背景）
	darkModeTextColor: "rgb(245, 245, 245)", // 浅色文字（用于暗背景）
	enableAutoDetect: true,
	threshold: 128,
};

// 缓存图像亮度计算结果
const brightnessCache = new Map<string, number>();

/**
 * Calculate image brightness with caching
 * @param imageUrl - Image URL to analyze
 * @returns Brightness value (0-255)
 */
export const getImageBrightness = (imageUrl: string): Promise<number> => {
	// 检查缓存
	const cached = brightnessCache.get(imageUrl);
	if (cached !== undefined) {
		return Promise.resolve(cached);
	}

	return new Promise((resolve) => {
		const img = new Image();
		// 不设置 crossOrigin，避免 CORS 错误
		// 如果服务器支持 CORS，可以在 canvas 中读取像素
		// 如果不支持，catch 会捕获 tainted canvas 错误并静默回退

		img.onload = () => {
			try {
				const canvas = document.createElement("canvas");
				canvas.width = Math.min(img.width, 200); // 限制最大尺寸以提高性能
				canvas.height = Math.min(img.height, 200);

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					// 无法获取 canvas 上下文，假设背景较亮，使用深色文字
					resolve(200);
					return;
				}

				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				// Sample center area of image for better accuracy
				const sampleX = Math.floor(canvas.width * 0.25);
				const sampleY = Math.floor(canvas.height * 0.25);
				const sampleWidth = Math.floor(canvas.width * 0.5);
				const sampleHeight = Math.floor(canvas.height * 0.5);

				const imageData = ctx.getImageData(
					sampleX,
					sampleY,
					sampleWidth,
					sampleHeight,
				);

				const data = imageData.data;
				let brightness = 0;
				let pixelCount = 0;

				// Calculate average brightness using optimized loop
				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];

					// Using luminance formula: 0.299*R + 0.587*G + 0.114*B
					brightness += (r * 299 + g * 587 + b * 114) / 1000;
					pixelCount++;
				}

				brightness = Math.floor(brightness / pixelCount);
				brightnessCache.set(imageUrl, brightness);
				resolve(brightness);
			} catch {
				// Tainted canvas 错误（服务器不支持 CORS）- 假设背景较亮，使用深色文字
				resolve(200);
			}
		};

		img.onerror = () => {
			// 图片加载失败 - 假设背景较亮，使用深色文字
			resolve(200);
		};

		img.src = imageUrl;
	});
};

/**
 * Determine if text should be dark or light based on brightness
 */
export const shouldUseDarkText = (
	brightness: number,
	threshold = 128,
): boolean => {
	return brightness > threshold;
};

/**
 * Apply text color based on background brightness
 */
export const applyAdaptiveTextColor = async (
	imageUrl: string,
	config: TextColorConfig = defaultColorConfig,
): Promise<void> => {
	if (!config.enableAutoDetect) return;

	try {
		const root = document.documentElement;
		const isDark = root.classList.contains("dark");

		// 暗色模式直接使用浅色文字，不需要亮度检测
		if (isDark) {
			root.style.setProperty("--adaptive-text-color", config.darkModeTextColor);
			return;
		}

		// 亮色模式进行亮度检测
		const brightness = await getImageBrightness(imageUrl);
		const useDarkText = shouldUseDarkText(brightness, config.threshold);

		const color = useDarkText
			? config.lightModeTextColor
			: config.darkModeTextColor;
		root.style.setProperty("--adaptive-text-color", color);
	} catch {
		// 亮度检测失败时，使用浅色文字（深色），避免在浅色背景上显示白色文字
		document.documentElement.style.setProperty(
			"--adaptive-text-color",
			config.lightModeTextColor,
		);
	}
};

/**
 * Get CSS variable for adaptive text color
 */
export const getAdaptiveColorCSS = (): string => {
	return "var(--adaptive-text-color)";
};
