"use client"

import * as React from "react"
import {
	MessageSquare,
	History,
	MoreHorizontal,
	Globe,
	Lock
} from "lucide-react"
import type { User as NextAuthUser } from "next-auth"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import useSWRInfinite from "swr/infinite"
import { motion } from "framer-motion"

import { ZueLogo } from "@/components/zue-logo"
import { useChatVisibility } from "@/hooks/use-chat-visibility"
import type { Chat } from "@/lib/db/schema"
import { fetcher } from "@/lib/utils"
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
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
import { Switch } from "@/components/ui/switch"
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
import {
	CheckCircleFillIcon,
	GlobeIcon,
	LockIcon,
	ShareIcon,
	TrashIcon
} from "./icons"

type GroupedChats = {
	today: Chat[]
	yesterday: Chat[]
	lastWeek: Chat[]
	lastMonth: Chat[]
	older: Chat[]
}

export interface ChatHistory {
	chats: Array<Chat>
	hasMore: boolean
}

const PAGE_SIZE = 20

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
	const now = new Date()
	const oneWeekAgo = subWeeks(now, 1)
	const oneMonthAgo = subMonths(now, 1)

	return chats.reduce(
		(groups, chat) => {
			const chatDate = new Date(chat.createdAt)

			if (isToday(chatDate)) {
				groups.today.push(chat)
			} else if (isYesterday(chatDate)) {
				groups.yesterday.push(chat)
			} else if (chatDate > oneMonthAgo) {
				groups.lastMonth.push(chat)
			} else {
				groups.older.push(chat)
			}

			return groups
		},
		{
			today: [],
			yesterday: [],
			lastWeek: [],
			lastMonth: [],
			older: []
		} as GroupedChats
	)
}

export function getChatHistoryPaginationKey(
	pageIndex: number,
	previousPageData: ChatHistory
) {
	if (previousPageData && previousPageData.hasMore === false) {
		return null
	}

	if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`

	const firstChatFromPage = previousPageData.chats.at(-1)

	if (!firstChatFromPage) return null

	return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`
}

export function AppSidebar({
	user,
	...props
}: { user: NextAuthUser | undefined } & React.ComponentProps<typeof Sidebar>) {
	const { setOpen } = useSidebar()
	const router = useRouter()
	const { id } = useParams()

	const {
		data: paginatedChatHistories,
		setSize,
		isValidating,
		isLoading,
		mutate
	} = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
		fallbackData: []
	})

	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const hasReachedEnd = paginatedChatHistories
		? paginatedChatHistories.some((page) => page.hasMore === false)
		: false

	const hasEmptyChatHistory = paginatedChatHistories
		? paginatedChatHistories.every((page) => page.chats.length === 0)
		: false

	const handleDelete = async () => {
		const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
			method: "DELETE"
		})

		toast.promise(deletePromise, {
			loading: "Deleting chat...",
			success: () => {
				mutate((chatHistories) => {
					if (chatHistories) {
						return chatHistories.map((chatHistory) => ({
							...chatHistory,
							chats: chatHistory.chats.filter(
								(chat) => chat.id !== deleteId
							)
						}))
					}
				})

				return "Chat deleted successfully"
			},
			error: "Failed to delete chat"
		})

		setShowDeleteDialog(false)

		if (deleteId === id) {
			router.push("/")
		}
	}

	return (
		<>
			<Sidebar {...props}>
				<SidebarHeader className="gap-3.5 border-b p-4">
					<SidebarInput placeholder="Search conversations..." />
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup className="px-0">
						<SidebarGroupContent>
							{!user ? (
								<div className="p-4 text-center text-sm text-muted-foreground">
									Login to save and revisit previous chats!
								</div>
							) : isLoading ? (
								<div className="flex flex-col">
									{[44, 32, 28, 64, 52].map((item, index) => (
										<div
											key={index}
											className="flex flex-col gap-2 border-b p-4 last:border-b-0"
										>
											<div className="flex items-center gap-2">
												<div
													className="h-4 rounded bg-sidebar-accent-foreground/10 flex-1"
													style={{
														width: `${item}%`
													}}
												/>
												<div className="h-3 w-12 rounded bg-sidebar-accent-foreground/10" />
											</div>
											<div className="h-3 w-3/4 rounded bg-sidebar-accent-foreground/10" />
											<div className="h-3 w-1/2 rounded bg-sidebar-accent-foreground/10" />
										</div>
									))}
								</div>
							) : hasEmptyChatHistory ? (
								<div className="p-4 text-center text-sm text-muted-foreground">
									Your conversations will appear here once you
									start chatting!
								</div>
							) : (
								<>
									{paginatedChatHistories &&
										(() => {
											const chatsFromHistory =
												paginatedChatHistories.flatMap(
													(paginatedChatHistory) =>
														paginatedChatHistory.chats
												)

											const groupedChats =
												groupChatsByDate(
													chatsFromHistory
												)

											return (
												<div className="flex flex-col">
													{groupedChats.today.length >
														0 && (
														<div>
															<div className="px-4 py-2 text-xs font-medium text-sidebar-foreground/70 bg-sidebar-accent/50">
																Today
															</div>
															{groupedChats.today.map(
																(chat) => (
																	<ChatItem
																		key={
																			chat.id
																		}
																		chat={
																			chat
																		}
																		isActive={
																			chat.id ===
																			id
																		}
																		onDelete={(
																			chatId
																		) => {
																			setDeleteId(
																				chatId
																			)
																			setShowDeleteDialog(
																				true
																			)
																		}}
																		setOpenMobile={() =>
																			setOpen(
																				false
																			)
																		}
																	/>
																)
															)}
														</div>
													)}

													{groupedChats.yesterday
														.length > 0 && (
														<div>
															<div className="px-4 py-2 text-xs font-medium text-sidebar-foreground/70 bg-sidebar-accent/50">
																Yesterday
															</div>
															{groupedChats.yesterday.map(
																(chat) => (
																	<ChatItem
																		key={
																			chat.id
																		}
																		chat={
																			chat
																		}
																		isActive={
																			chat.id ===
																			id
																		}
																		onDelete={(
																			chatId
																		) => {
																			setDeleteId(
																				chatId
																			)
																			setShowDeleteDialog(
																				true
																			)
																		}}
																		setOpenMobile={() =>
																			setOpen(
																				false
																			)
																		}
																	/>
																)
															)}
														</div>
													)}

													{groupedChats.lastWeek
														.length > 0 && (
														<div>
															<div className="px-4 py-2 text-xs font-medium text-sidebar-foreground/70 bg-sidebar-accent/50">
																Last 7 days
															</div>
															{groupedChats.lastWeek.map(
																(chat) => (
																	<ChatItem
																		key={
																			chat.id
																		}
																		chat={
																			chat
																		}
																		isActive={
																			chat.id ===
																			id
																		}
																		onDelete={(
																			chatId
																		) => {
																			setDeleteId(
																				chatId
																			)
																			setShowDeleteDialog(
																				true
																			)
																		}}
																		setOpenMobile={() =>
																			setOpen(
																				false
																			)
																		}
																	/>
																)
															)}
														</div>
													)}

													{groupedChats.lastMonth
														.length > 0 && (
														<div>
															<div className="px-4 py-2 text-xs font-medium text-sidebar-foreground/70 bg-sidebar-accent/50">
																Last 30 days
															</div>
															{groupedChats.lastMonth.map(
																(chat) => (
																	<ChatItem
																		key={
																			chat.id
																		}
																		chat={
																			chat
																		}
																		isActive={
																			chat.id ===
																			id
																		}
																		onDelete={(
																			chatId
																		) => {
																			setDeleteId(
																				chatId
																			)
																			setShowDeleteDialog(
																				true
																			)
																		}}
																		setOpenMobile={() =>
																			setOpen(
																				false
																			)
																		}
																	/>
																)
															)}
														</div>
													)}

													{groupedChats.older.length >
														0 && (
														<div>
															<div className="px-4 py-2 text-xs font-medium text-sidebar-foreground/70 bg-sidebar-accent/50">
																Older
															</div>
															{groupedChats.older.map(
																(chat) => (
																	<ChatItem
																		key={
																			chat.id
																		}
																		chat={
																			chat
																		}
																		isActive={
																			chat.id ===
																			id
																		}
																		onDelete={(
																			chatId
																		) => {
																			setDeleteId(
																				chatId
																			)
																			setShowDeleteDialog(
																				true
																			)
																		}}
																		setOpenMobile={() =>
																			setOpen(
																				false
																			)
																		}
																	/>
																)
															)}
														</div>
													)}
												</div>
											)
										})()}

									<motion.div
										onViewportEnter={() => {
											if (
												!isValidating &&
												!hasReachedEnd
											) {
												setSize((size) => size + 1)
											}
										}}
									/>

									{hasReachedEnd ? (
										<div className="p-4 text-center text-xs text-muted-foreground">
											You have reached the end of your
											chat history.
										</div>
									) : (
										<div className="p-4 text-center text-xs text-muted-foreground">
											Loading more chats...
										</div>
									)}
								</>
							)}
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete your chat and remove it from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

function ChatItem({
	chat,
	isActive,
	onDelete,
	setOpenMobile
}: {
	chat: Chat
	isActive: boolean
	onDelete: (chatId: string) => void
	setOpenMobile: (open: boolean) => void
}) {
	const { visibilityType, setVisibilityType } = useChatVisibility({
		chatId: chat.id,
		initialVisibilityType: chat.visibility
	})

	const router = useRouter()

	const handleChatClick = () => {
		setOpenMobile(false)
		router.push(`/chat/${chat.id}`)
	}

	return (
		<div className="group relative">
			<a
				href={`/chat/${chat.id}`}
				onClick={(e) => {
					e.preventDefault()
					handleChatClick()
				}}
				className={`flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
					isActive
						? "bg-sidebar-accent text-sidebar-accent-foreground"
						: ""
				}`}
			>
				<div className="flex w-full items-center gap-2">
					{visibilityType === "public" ? (
						<Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
					) : (
						<Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
					)}
					<span className="truncate font-medium">{chat.title}</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{new Date(chat.createdAt).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric"
						})}
					</span>
				</div>
			</a>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-sidebar-accent"
					>
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="bottom" align="end">
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="cursor-pointer">
							<ShareIcon />
							<span>Share</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem
									className="cursor-pointer flex-row justify-between"
									onClick={() => setVisibilityType("private")}
								>
									<div className="flex flex-row gap-2 items-center">
										<LockIcon size={12} />
										<span>Private</span>
									</div>
									{visibilityType === "private" ? (
										<CheckCircleFillIcon />
									) : null}
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer flex-row justify-between"
									onClick={() => setVisibilityType("public")}
								>
									<div className="flex flex-row gap-2 items-center">
										<GlobeIcon />
										<span>Public</span>
									</div>
									{visibilityType === "public" ? (
										<CheckCircleFillIcon />
									) : null}
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					<DropdownMenuItem
						className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive"
						onSelect={() => onDelete(chat.id)}
					>
						<TrashIcon />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
