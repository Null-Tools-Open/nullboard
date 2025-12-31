import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                caveat: ["var(--font-caveat)"],
            },
        },
    },
    plugins: [],
};
export default config;