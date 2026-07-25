"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Sparkles,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const productLinks = [
  { label: "Intake Forms", target: "services" },
  { label: "Dashboard", target: "features" },
  { label: "SLA Management", target: "services" },
  { label: "REST API", target: "services" },
]

const resourceLinks = [
  { label: "Guides", target: "blog" },
  { label: "API Docs", target: "blog" },
  { label: "FAQ", target: "faq" },
]

const aiLinks = [
  { label: "SLA Auto-Escalation", target: "services" },
  { label: "Repeat Detection", target: "features" },
  { label: "Smart Routing", target: "features" },
]

const languages = ["EN", "FR", "AR"]

function HeaderDivider({ isScrolled }: { isScrolled: boolean }) {
  return (
    <div
      className={`hidden lg:block w-px h-5 shrink-0 ${isScrolled ? "bg-zinc-200" : "bg-border"}`}
      aria-hidden
    />
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [language, setLanguage] = useState("EN")
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinkClass = `text-sm transition-colors cursor-pointer flex items-center gap-1 ${
    isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
  }`

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)

    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setIsOpen(false)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    setIsOpen(false)
  }

  const renderDropdown = (
    label: string,
    items: { label: string; target: string }[],
    icon?: React.ReactNode,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${navLinkClass} outline-none`}>
        {icon}
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[180px]">
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild>
            <a href={`#${item.target}`} onClick={(e) => handleSmoothScroll(e, item.target)}>
              {item.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "px-4 pt-4" : ""}`}>
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 ${
          isScrolled
            ? "bg-white backdrop-blur-xl rounded-2xl border border-zinc-200 px-4 lg:px-6 py-3"
            : "bg-background/90 backdrop-blur-md px-4 lg:px-6 py-5"
        }`}
      >
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer shrink-0">
            <svg
              className={`w-6 h-6 transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span
              className={`text-lg font-medium tracking-tight transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            >
              ResolveHQ
            </span>
          </a>

          {/* Center navigation */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
            {renderDropdown(
              "Complaint AI",
              aiLinks,
              <Sparkles className="w-3.5 h-3.5" />,
            )}
            {renderDropdown("Product", productLinks)}
            {renderDropdown("Resources", resourceLinks)}
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className={navLinkClass}
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSmoothScroll(e, "pricing")}
              className={`${navLinkClass} gap-2`}
            >
              Pricing
              <Badge
                variant="outline"
                className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
              >
                API v1
              </Badge>
            </a>
          </nav>

          {/* Right utilities */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label="Search"
              className={`p-2 rounded-md transition-colors ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            <HeaderDivider isScrolled={isScrolled} />

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm flex items-center gap-1.5 transition-colors ${
                    isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={`text-sm flex items-center gap-1.5 transition-colors ${
                    isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    isScrolled
                      ? "bg-black text-white hover:bg-zinc-800"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  Free trial
                </Link>

                <Link
                  href="/login"
                  className={`text-sm font-medium px-4 py-2 rounded-md border transition-colors ${
                    isScrolled
                      ? "border-zinc-300 text-black hover:bg-zinc-50"
                      : "border-border text-foreground hover:bg-accent"
                  }`}
                >
                  Login
                </Link>
              </>
            )}

            <HeaderDivider isScrolled={isScrolled} />

            <DropdownMenu>
              <DropdownMenuTrigger className={`${navLinkClass} outline-none`}>
                <span>{language}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[80px]">
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}>
                    {lang}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className={`lg:hidden ml-auto transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <nav
            className={`lg:hidden mt-6 pb-6 flex flex-col gap-4 border-t pt-6 ${
              isScrolled ? "border-zinc-200" : "border-border"
            }`}
          >
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground px-1 mb-2">Complaint AI</p>
              {aiLinks.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.target}`}
                  onClick={(e) => handleSmoothScroll(e, item.target)}
                  className={`block py-2 px-1 ${navLinkClass}`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground px-1 mb-2">Product</p>
              {productLinks.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.target}`}
                  onClick={(e) => handleSmoothScroll(e, item.target)}
                  className={`block py-2 px-1 ${navLinkClass}`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground px-1 mb-2">Resources</p>
              {resourceLinks.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.target}`}
                  onClick={(e) => handleSmoothScroll(e, item.target)}
                  className={`block py-2 px-1 ${navLinkClass}`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className={`py-2 px-1 ${navLinkClass}`}
            >
              Features
            </a>

            <a
              href="#pricing"
              onClick={(e) => handleSmoothScroll(e, "pricing")}
              className={`py-2 px-1 ${navLinkClass} gap-2`}
            >
              Pricing
              <Badge
                variant="outline"
                className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
              >
                API v1
              </Badge>
            </a>

            <div
              className={`flex flex-col gap-3 mt-4 pt-4 border-t ${isScrolled ? "border-zinc-200" : "border-border"}`}
            >
              <button
                type="button"
                aria-label="Search"
                className={`flex items-center gap-2 py-2 ${navLinkClass}`}
              >
                <Search className="w-4 h-4" />
                Search
              </button>

              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className={`flex items-center gap-2 py-2 ${navLinkClass}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={`flex items-center gap-2 py-2 ${navLinkClass}`}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/register"
                    className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-md text-center transition-colors ${
                      isScrolled
                        ? "bg-black text-white hover:bg-zinc-800"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    Free trial
                  </Link>
                  <Link
                    href="/login"
                    className={`flex-1 text-sm font-medium px-4 py-2.5 rounded-md border text-center transition-colors ${
                      isScrolled
                        ? "border-zinc-300 text-black hover:bg-zinc-50"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    Login
                  </Link>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                      language === lang
                        ? isScrolled
                          ? "border-black text-black"
                          : "border-foreground text-foreground"
                        : isScrolled
                          ? "border-zinc-200 text-zinc-500"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
