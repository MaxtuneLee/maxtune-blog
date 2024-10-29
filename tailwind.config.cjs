function withOpacity(variableName) {
	return ({ opacityValue }) => {
		if (opacityValue !== undefined) {
			return `rgba(var(${variableName}), ${opacityValue})`;
		}
		return `rgb(var(${variableName}))`;
	};
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		// Remove the following screen breakpoint or add other breakpoints
		// if one breakpoint is not enough for you
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},

		extend: {
			textColor: {
				skin: {
					base: withOpacity("--color-text-base"),
					accent: withOpacity("--color-accent"),
					inverted: withOpacity("--color-fill"),
				},
			},
			backgroundColor: {
				skin: {
					fill: withOpacity("--color-fill"),
					accent: withOpacity("--color-accent"),
					inverted: withOpacity("--color-text-base"),
					card: withOpacity("--color-card"),
					"card-muted": withOpacity("--color-card-muted"),
				},
			},
			outlineColor: {
				skin: {
					fill: withOpacity("--color-accent"),
				},
			},
			borderColor: {
				skin: {
					line: withOpacity("--color-border"),
					fill: withOpacity("--color-text-base"),
					accent: withOpacity("--color-accent"),
				},
			},
			fill: {
				skin: {
					base: withOpacity("--color-text-base"),
					accent: withOpacity("--color-accent"),
				},
				transparent: "transparent",
			},
			fontFamily: {
				// mono: ["Noto Sans SC", "JetBrains Mono", "monospace"],
				mono: ["IBM Plex Mono", "monospace"],
				sans: ["Glow Sans SC Normal", "sans-serif"],
			},

			fontWeight: {
				regular: 300,
				medium: 400
			},

			typography: {
				DEFAULT: {
					css: {
						pre: {
							color: true,
							fontFamily: {
								mono: ["IBM Plex Mono", "monospace"],
							},
						},
						code: {
							color: true,
							fontFamily: {mono:["IBM Plex Mono", "monospace"]},
						},
					},
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
