"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Code2,
    Compass,
    FolderPlus,
    History,
    Home,
    LayoutDashboard,
    Lightbulb,
    type LucideIcon,
    Plus,
    Settings,
    Star,
    Terminal,
    Zap,
    Database,
    FlameIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarGroupAction,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"

// Define the interface for a single playground item, icon is now a string
interface PlaygroundData {
    id: string
    name: string
    icon: string // Changed to string
    starred: boolean
}

// Map icon names (strings) to their corresponding LucideIcon components
const lucideIconMap: Record<string, LucideIcon> = {
    Zap: Zap,
    Lightbulb: Lightbulb,
    Database: Database,
    Compass: Compass,
    FlameIcon: FlameIcon,
    Terminal: Terminal,
    Code2: Code2, // Include the default icon
    // Add any other icons you might use dynamically
}

export function DashboardSidebar({ initialPlaygroundData }: { initialPlaygroundData: PlaygroundData[] }) {
    const pathname = usePathname()
    const [starredPlaygrounds, setStarredPlaygrounds] = useState(initialPlaygroundData.filter((p) => p.starred))
    const [recentPlaygrounds, setRecentPlaygrounds] = useState(initialPlaygroundData)


    
    return (
        <Sidebar variant="inset" collapsible="icon" className="border-r border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-3 justify-center">
                    <Link href="/">
                        <Image src={"/logo.svg"} alt="logo" height={140} width={140} className="transition-transform hover:scale-105" />
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home" className="font-medium hover:bg-accent/80">
                                <Link href="/">
                                    <Home className="h-5 w-5 stroke-2" />
                                    <span className="text-base">Home</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard" className="font-medium hover:bg-accent/80">
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-5 w-5 stroke-2" />
                                    <span className="text-base">Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm font-semibold text-foreground/80 px-2 py-2">
                        <Star className="h-4 w-4 mr-2 stroke-[2.5]" />
                        Starred
                    </SidebarGroupLabel>
                    <SidebarGroupAction title="Add starred playground">
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>

                            {starredPlaygrounds.length === 0 && recentPlaygrounds.length === 0 ? (
                                <div className="text-center text-muted-foreground font-medium py-6 px-4 w-full text-sm">Create your playground</div>
                            ) : (
                                starredPlaygrounds.map((playground) => {
                                    const IconComponent = lucideIconMap[playground.icon] || Code2;
                                    return (
                                        <SidebarMenuItem key={playground.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === `/playground/${playground.id}`}
                                                tooltip={playground.name}
                                                className="hover:bg-accent/80"
                                            >
                                                <Link href={`/playground/${playground.id}`}>
                                                    {IconComponent && <IconComponent className="h-5 w-5 stroke-2" />}
                                                    <span className="font-medium">{playground.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm font-semibold text-foreground/80 px-2 py-2">
                        <History className="h-4 w-4 mr-2 stroke-[2.5]" />
                        Recent
                    </SidebarGroupLabel>
                    <SidebarGroupAction title="Create new playground">
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {starredPlaygrounds.length === 0 && recentPlaygrounds.length === 0 ? null : (
                                recentPlaygrounds.map((playground) => {
                                    const IconComponent = lucideIconMap[playground.icon] || Code2;
                                    return (
                                        <SidebarMenuItem key={playground.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === `playground/${playground.id}`}
                                                tooltip={playground.name}
                                                className="hover:bg-accent/80"
                                            >
                                                <Link href={`/playground/${playground.id}`}>
                                                    {IconComponent && <IconComponent className="h-5 w-5 stroke-2" />}
                                                    <span className="font-medium">{playground.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })
                            )}
                            <SidebarMenuItem>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}