"use client"

import { ChevronUp } from "lucide-react"
import type { User } from "next-auth"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { guestRegex } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { LoaderIcon } from "./icons"
import { toast } from "./toast"
import { cn } from "@/lib/utils"

export function SidebarUserNav({ user }: { user: User }) {
	const router = useRouter()
	const { data, status } = useSession()
	const { setTheme, theme } = useTheme()
	const [open, setOpen] = useState(false)

	const isGuest = guestRegex.test(data?.user?.email ?? "")

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				{status === "loading" ? (
					<Button
						variant="outline"
						className="px-2 h-8 md:h-[34px] gap-1 md:gap-2"
					>
						<div className="size-4 bg-zinc-500/30 rounded-full animate-pulse" />
						<div className="animate-spin text-zinc-500">
							<LoaderIcon size={12} />
						</div>
					</Button>
				) : (
					<Button
						data-testid="user-nav-button"
						variant="outline"
						className="px-2 h-8 md:h-[34px] gap-1 md:gap-2"
					>
						<Image
							src={`https://avatar.vercel.sh/${user.email}`}
							alt={user.email ?? "User Avatar"}
							width={16}
							height={16}
							className="rounded-full"
						/>
						<div
							className={cn(
								"transition-transform duration-200",
								!open && "rotate-180"
							)}
						>
							<ChevronUp className="h-3 w-3" />
						</div>
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				data-testid="user-nav-menu"
				side="bottom"
				align="end"
				className="min-w-[200px]"
			>
				<DropdownMenuItem
					data-testid="user-nav-item-theme"
					className="cursor-pointer"
					onSelect={() =>
						setTheme(theme === "dark" ? "light" : "dark")
					}
				>
					{`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild data-testid="user-nav-item-auth">
					<button
						type="button"
						className="w-full cursor-pointer"
						onClick={() => {
							if (status === "loading") {
								toast({
									type: "error",
									description:
										"Checking authentication status, please try again!"
								})

								return
							}

							if (isGuest) {
								router.push("/login")
							} else {
								signOut({
									redirectTo: "/"
								})
							}
						}}
					>
						{isGuest ? "Login to your account" : "Sign out"}
					</button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
