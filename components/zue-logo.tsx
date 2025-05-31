import { cn } from "@/lib/utils"

interface ZueLogoProps {
	size?: "8" | "12" | "16" | "20" | "24" | "28" | "32" | "48"
	variant?:
		| "auto"
		| "default"
		| "white"
		| "black"
		| "zinc"
		| "yellow"
		| "purple"
	className?: string
}

export function ZueLogo({
	size = "8",
	variant = "auto",
	className = ""
}: ZueLogoProps) {
	const sizeClasses = {
		"8": 32,
		"12": 48,
		"16": 64,
		"20": 80,
		"24": 96,
		"28": 112,
		"32": 128,
		"48": 192
	}

	const variantClasses = {
		auto: "text-zinc-500 dark:text-zinc-400",
		default: "text-zinc-500", // Your #71717A
		white: "text-white",
		black: "text-black",
		zinc: "text-zinc-400", // Your #A1A1AA
		yellow: "text-[#FFCA80]",
		purple: "text-[#0c0013]"
	}

	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-2xl backdrop-blur-lg",
				variantClasses[variant],
				className
			)}
			style={{
				width: `${sizeClasses[size]}px`,
				height: `${sizeClasses[size]}px`
			}}
		>
			<svg
				viewBox="0 0 129.223 44.841"
				fill="currentColor"
				className="w-full h-full"
				aria-label="Zue Logo"
			>
				<title>Zue Logo</title>
				<g transform="translate(-72.5 -744.802)">
					<path
						d="M75.262 746.513v1.25h22.244L74.43 788.167h34.658v-1.25H86.843l23.077-40.405zm36.74 27.659c0 8.914 6.499 14.83 16.163 14.83 5.748 0 11.414-4.166 13.746-10.081v4.915c0 3 1.167 4.332 3.916 4.332h6.165v-41.655h-.417l-9.58 7.747-.084 20.912c-1.666 5.498-5.415 8.747-10.33 8.747-6.082 0-9.581-3.832-9.581-10.497v-26.91h-.417l-9.58 7.748zm53.736-8.914c0-10.581 4.999-17.912 12.164-17.912 5.248 0 8.664 3.249 8.664 8.247 0 6.332-4.749 9.831-13.33 9.831h-7.498zm12.414-19.245c-12.83 0-23.244 9.664-23.244 21.494 0 12.247 9.997 21.494 23.244 21.494 9.914 0 15.412-3.832 20.16-14.08h-.416c-4.499 8.082-8.747 11.164-15.079 11.164-9.497 0-16.412-7.914-17.079-19.411h32.325c0-12.247-8.081-20.661-19.911-20.661"
						style={{ fillRule: "evenodd" }}
						aria-label="zue"
					/>
				</g>
			</svg>
		</div>
	)
}
