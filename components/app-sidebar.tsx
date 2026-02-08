"use client"

import * as React from "react"
import {
	Wand2,
	Images,
	Heart,
	FolderOpen,
	MoreHorizontal,
	Plus,
	SearchIcon
} from "lucide-react"
import type { User as NextAuthUser } from "next-auth"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import { motion } from "framer-motion"

import { ZueLogo } from "@/components/zue-logo"
import { getUserImages } from "@/lib/actions/generate"
import type { DBImage } from "@/lib/db/schema"
import { fetcher } from "@/lib/utils"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export function AppSidebar({
	user,
	...props
}: { user: NextAuthUser | undefined } & React.ComponentProps<typeof Sidebar>) {
	const { setOpen } = useSidebar()
	const router = useRouter()
	const pathname = usePathname()

	const {
		data: images,
		isLoading,
		mutate
	} = useSWR<DBImage[]>("/api/images", fetcher, {
		fallbackData: []
	})

	const [searchQuery, setSearchQuery] = useState("")

	const recentImages = images?.slice(0, 10) || []
	const filteredImages = recentImages.filter((image) =>
		image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const handleNewImage = () => {
		router.push("/generate")
		setOpen(false)
	}

	return (
		<Sidebar className="group-data-[side=left]:border-r-0" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<div className="flex flex-row justify-between items-center">
						<div
							onClick={() => {
								router.push("/generate")
								setOpen(false)
							}}
							className="flex flex-row gap-3 items-center"
						>
							<span className="text-lg font-semibold px-2 hover:bg-muted rounded-2xl cursor-pointer">
								ZUE Images
							</span>
						</div>
						<Button
							variant="ghost"
							type="button"
							className="p-2 h-fit rounded-full"
							onClick={handleNewImage}
						>
							<Plus className="size-4" />
						</Button>
					</div>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{/* Navigation Items */}
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => router.push("/generate")}
									isActive={pathname === "/generate"}
								>
									<Wand2 />
									Generate Images
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => router.push("/gallery")}
									isActive={pathname === "/gallery"}
								>
									<Images />
									Gallery
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => router.push("/collections")}
									isActive={pathname === "/collections"}
								>
									<FolderOpen />
									Collections
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => router.push("/prompts")}
									isActive={pathname === "/prompts"}
								>
									<Heart />
									Saved Prompts
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Recent Images */}
				<SidebarGroup>
					<div className="flex flex-row justify-between items-center px-2 mb-2">
						<Label className="text-xs text-muted-foreground font-medium">
							Recent Images
						</Label>
						{recentImages.length > 0 && (
							<Badge variant="outline" className="text-xs">
								{recentImages.length}
							</Badge>
						)}
					</div>
					<SidebarGroupContent>
						<div className="px-2 mb-2">
							<SidebarInput
								placeholder="Search images..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-8"
							/>
						</div>
						<SidebarMenu>
							{isLoading ? (
								// Loading skeleton
								[44, 32, 28, 64, 52].map((width, i) => (
									<div
										key={i}
										className="rounded-2xl h-8 flex gap-2 px-2 items-center"
									>
										<div
											className="h-4 rounded-2xl flex-1 bg-sidebar-accent-foreground/10"
											style={{ width: `${width}%` }}
										/>
									</div>
								))
							) : filteredImages.length > 0 ? (
								filteredImages.map((image) => (
									<ImageItem
										key={image.id}
										image={image}
										onClick={() => {
											router.push(
												`/gallery?image=${image.id}`
											)
											setOpen(false)
										}}
									/>
								))
							) : (
								<div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
									{searchQuery
										? "No matching images"
										: "No images yet"}
								</div>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="gap-0 -mx-2">
				{user && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton className="h-10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<span className="text-xs font-bold uppercase">
										{user.email?.[0] ??
											user.name?.[0] ??
											"U"}
									</span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.name ?? "User"}
									</span>
									<span className="truncate text-xs text-muted-foreground">
										{user.email}
									</span>
								</div>
								<MoreHorizontal className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side="bottom"
							align="end"
							sideOffset={4}
						>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => {
									router.push("/generate")
								}}
							>
								Dashboard
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer"
								onSelect={(event) => {
									event.preventDefault()
									router.push("/api/auth/signout")
								}}
							>
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</SidebarFooter>
		</Sidebar>
	)
}

function ImageItem({
	image,
	onClick
}: {
	image: DBImage
	onClick: () => void
}) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				className="h-auto p-2 text-left"
				onClick={onClick}
			>
				<div className="flex items-center gap-3 w-full">
					<div className="size-8 rounded bg-muted flex-shrink-0 overflow-hidden">
						{image.imageUrl && image.status === "completed" ? (
							<img
								src={image.imageUrl}
								alt="Generated artwork"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<Wand2 className="h-3 w-3 text-muted-foreground" />
							</div>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">
							{image.prompt.slice(0, 40)}
							{image.prompt.length > 40 ? "..." : ""}
						</p>
						<div className="flex items-center gap-2 mt-1">
							<Badge
								variant="outline"
								className="text-xs h-4 px-1"
							>
								{image.status}
							</Badge>
							<span className="text-xs text-muted-foreground">
								{new Date(image.createdAt).toLocaleDateString()}
							</span>
						</div>
					</div>
				</div>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}
