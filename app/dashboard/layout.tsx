'use client'

import * as React from 'react'
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  Home,
  LifeBuoy,
  LogOut,
  Package,
  Settings,
  Users,
  Sun,
  Moon,
  LucideLoader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  const adminNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Clients',
      href: '/dashboard/clients',
      icon: Users,
    },
    {
      title: 'Warehouse',
      href: '/dashboard/warehouse',
      icon: Building2,
    },
    {
      title: 'Invoices',
      href: '/dashboard/invoices',
      icon: FileText,
    },
    {
      title: 'Agreements',
      href: '/dashboard/agreements',
      icon: ClipboardList,
    },
    {
      title: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
    },
    {
      title: 'Support',
      href: '/dashboard/support',
      icon: LifeBuoy,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  const clientNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'My Spaces',
      href: '/dashboard/spaces',
      icon: Package,
    },
    {
      title: 'Invoices',
      href: '/dashboard/invoices',
      icon: FileText,
    },
    {
      title: 'Agreements',
      href: '/dashboard/agreements',
      icon: ClipboardList,
    },
    {
      title: 'Support',
      href: '/dashboard/support',
      icon: LifeBuoy,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  // Determine navigation items based on user role
  const isAdmin = session?.user?.role === 'ADMIN'
  const navItems = isAdmin ? adminNavItems : clientNavItems

  // Handle loading state
  if (status === 'loading') {
    
    return <div className='flex h-screen items-center justify-center'><LucideLoader2 className='h-6 w-6 animate-spin' /></div>
  }

  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 animate-pulse" />
          <h1 className="text-2xl font-semibold">Please sign in to access the dashboard</h1>
        </div>
        <p className="text-muted-foreground">Redirecting to login page...</p>
        <div className="h-1 w-64 overflow-hidden rounded-full bg-gray-200">
          <div 
            className="h-full bg-primary animate-[progress_2s_linear_forwards]" 
            style={{ animationName: 'progress' }}
          />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-4 bg-blue-900">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className='text-lg text-white'>WMS</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{isAdmin ? 'Admin' : 'Client'} Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || '/placeholder-user.jpg'} alt="User" />
                      <AvatarFallback>{isAdmin ? 'AD' : 'CL'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name || (isAdmin ? 'Admin User' : 'Client User')}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email || (isAdmin ? 'admin@wms.com' : 'client@example.com')}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {session?.user?.name || (isAdmin ? 'Admin User' : 'Client User')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isAdmin ? 'Administrator' : `Vendor: ${session?.user?.id || 'WMS001'}`}
                </span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          <div className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Warehouse Management System</h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="h-8 w-8"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}