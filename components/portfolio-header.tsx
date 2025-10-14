"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mail, Linkedin, Github, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

const socialLinks = [
  { icon: Mail, href: "mailto:benedict@example.com", label: "Email" },
  { icon: Linkedin, href: "https://linkedin.com/in/benedict", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/benedict", label: "GitHub" },
]

const navigationItems = [
  { href: "#work-experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#blog", label: "Blog" },
  { href: "#habit-tracker", label: "Habits" },
]

export function PortfolioHeader() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Avatar and Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20 shadow-lg transition-all duration-300 hover:ring-primary/30 hover:shadow-xl">
              <AvatarImage src="/memoji-style-avatar-of-young-software-developer.jpg" alt="Benedict Gio B. Illustrisimo" />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-lg">
                BI
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground tracking-tight">Benedict Gio B. Illustrisimo</h1>
              <p className="text-muted-foreground font-medium">Software Developer</p>
              <p className="text-sm text-muted-foreground/80">21 years old</p>
            </div>
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-full hover:bg-accent/50"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side - Social Links and Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Desktop Social Links */}
            <div className="hidden md:flex items-center gap-1">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-10 w-10 rounded-full transition-all duration-300 hover:bg-accent/10 hover:scale-105 active:scale-95"
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                </Button>
              ))}
            </div>

            <ThemeToggle />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-full">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 pt-6">
                  {/* Mobile Profile Info */}
                  <div className="flex items-center gap-4 sm:hidden">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src="/memoji-style-avatar.jpg" alt="Benedict" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">BI</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-bold text-foreground">Benedict Gio B. Illustrisimo</h2>
                      <p className="text-sm text-muted-foreground">Software Developer</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Navigation
                    </h3>
                    {navigationItems.map((item) => (
                      <Button key={item.href} variant="ghost" asChild className="justify-start h-12 text-base">
                        <a href={item.href}>{item.label}</a>
                      </Button>
                    ))}
                  </nav>

                  {/* Mobile Social Links */}
                  <div className="md:hidden">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Connect
                    </h3>
                    <div className="flex gap-2">
                      {socialLinks.map((social) => (
                        <Button
                          key={social.label}
                          variant="outline"
                          size="icon"
                          asChild
                          className="h-12 w-12 bg-transparent"
                        >
                          <a href={social.href} target="_blank" rel="noopener noreferrer">
                            <social.icon className="h-5 w-5" />
                            <span className="sr-only">{social.label}</span>
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
