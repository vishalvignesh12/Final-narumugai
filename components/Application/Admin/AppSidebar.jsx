'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LuChevronRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { adminAppSidebarMenu } from "@/lib/adminSidebarMenu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"


const AppSidebar = () => {
    const { toggleSidebar, setOpenMobile } = useSidebar()
    const pathname = usePathname()
    const isMobile = useIsMobile()
    
    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }, [pathname, isMobile, setOpenMobile])
    
    // Handle link clicks - only close sidebar for actual navigation links, not parent menu toggles
    const handleLinkClick = (hasSubmenu = false, url = "") => {
        // Don't close sidebar if it's a parent menu item with submenus (url is "#")
        if (hasSubmenu && url === "#") {
            return // Let the collapsible handle the toggle
        }
        
        // Only close mobile sidebar for actual navigation links
        if (isMobile && url !== "#") {
            setOpenMobile(false)
        }
    }
    
    return (
        <Sidebar className="z-50">
            <SidebarHeader className="border-b h-14 p-0">
                <div className="flex justify-between items-center px-4">
                    <h1 className='text-4xl font-bold text-pink-500 mb-3'>Narumugai</h1>
                    {/* Close button - keep mobile-only for original mobile behavior */}
                    <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden">
                        <IoMdClose />
                    </Button>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-3">
                <SidebarMenu>
                    {adminAppSidebarMenu.map((menu, index) => (
                        <Collapsible key={index} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton asChild className="font-semibold px-2 py-5">
                                        {menu.submenu && menu.submenu.length > 0 ? (
                                            // Parent menu item with submenus - make it a button, not a link
                                            <div className="flex items-center w-full cursor-pointer" onClick={() => handleLinkClick(true, menu.url)}>
                                                <menu.icon />
                                                {menu.title}
                                                <LuChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </div>
                                        ) : (
                                            // Regular menu item without submenus - keep as link
                                            <Link href={menu?.url} onClick={() => handleLinkClick(false, menu.url)}>
                                                <menu.icon />
                                                {menu.title}
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                {menu.submenu && menu.submenu.length > 0
                                    &&
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {menu.submenu.map((submenuItem, subMenuIndex) => (
                                                <SidebarMenuSubItem key={subMenuIndex}>
                                                    <SidebarMenuSubButton asChild className="px-2 py-5">
                                                        <Link href={submenuItem.url} onClick={() => handleLinkClick(false, submenuItem.url)}>
                                                            {submenuItem.title}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                }

                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarContent>

        </Sidebar>
    )
}

export default AppSidebar