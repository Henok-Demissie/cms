"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ChevronDown, Globe2, Menu, X } from "lucide-react"

import { SiteSearch } from "@/components/marketing/site-search"
import { ThemeToggle } from "@/components/marketing/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  languages,
  translateNavLabel,
  type Language,
} from "@/lib/marketing-i18n"

const navLinks = [
  { label: "Home", target: "top" },
  { label: "About", target: "about" },
  { label: "Features", target: "features" },
  { label: "Service Catalog", target: "services" },
  { label: "Contact", target: "contact" },
  { label: "Feedback", target: "feedback" },
  { label: "Suggestions", target: "suggestions" },
  { label: "FAQ", target: "faq" },
]

const LANGUAGE_STORAGE_KEY = "resolvehq-language"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [language, setLanguage] = useState<Language>("EN")
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
    if (savedLanguage && languages.includes(savedLanguage)) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage.toLowerCase()
    }
  }, [])

  const navLinkClass =
    "whitespace-nowrap text-sm transition duration-200 ease-out inline-flex items-center gap-1 group text-muted-foreground hover:text-foreground"

  const navigateToSection = (targetId: string) => {
    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      setIsOpen(false)
      return
    }

    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setIsOpen(false)
      return
    }

    window.location.hash = targetId
    setIsOpen(false)
  }

  const handleSmoothScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    event.preventDefault()
    navigateToSection(targetId)
  }

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigateToSection("top")
  }

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    document.documentElement.lang = nextLanguage.toLowerCase()
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "px-3 pt-3 lg:px-6" : "px-3 lg:px-6"
      }`}
    >
      <div
        className={`mx-auto w-full max-w-[96rem] transition-all duration-300 ${
          isScrolled
            ? "rounded-2xl border border-border bg-background/95 px-4 py-2.5 shadow-sm backdrop-blur-xl lg:px-6"
            : "border border-transparent bg-background/90 px-4 py-3 backdrop-blur-md lg:px-6"
        }`}
      >
        <div className="flex items-center gap-3 xl:gap-4">
          <a
            href="#"
            onClick={handleLogoClick}
            className="flex shrink-0 items-center gap-1.5 cursor-pointer"
          >
            <svg
              className="h-4 w-4 text-foreground transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-medium tracking-tight text-foreground transition-colors duration-300">
              ResolveHQ
            </span>
          </a>

          <nav className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-x-2 overflow-x-auto px-1 [scrollbar-width:none] lg:flex xl:gap-x-3 [&::-webkit-scrollbar]:hidden">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={`#${item.target}`}
                onClick={(event) => handleSmoothScroll(event, item.target)}
                className={`${navLinkClass} shrink-0 relative before:absolute before:left-0 before:-bottom-1 before:h-[2px] before:w-full before:scale-x-0 before:bg-foreground before:transition-transform before:duration-200 before:origin-left hover:before:scale-x-100`}
              >
                {translateNavLabel(language, item.label)}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
            <SiteSearch
              className="w-36 xl:w-44"
              placeholder={translateNavLabel(language, "Search")}
              onNavigate={navigateToSection}
            />

            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-none"
                aria-label="Select language"
              >
                <Globe2 className="h-4 w-4" />
                <span>{language}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[88px]">
                {languages.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleLanguageChange(option)}
                    className={language === option ? "font-medium" : undefined}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition duration-200 hover:bg-foreground/90 md:text-sm"
              >
                {translateNavLabel(language, "Dashboard")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition duration-200 hover:bg-foreground/90 md:text-sm"
              >
                {translateNavLabel(language, "Sign In")}
              </Link>
            )}
          </div>

          <button
            type="button"
            className="ml-auto text-foreground transition-colors duration-300 lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <nav className="mt-5 flex flex-col gap-4 border-t border-border pt-5 lg:hidden">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={`#${item.target}`}
                onClick={(event) => handleSmoothScroll(event, item.target)}
                className={`block py-2 px-1 ${navLinkClass}`}
              >
                {translateNavLabel(language, item.label)}
              </a>
            ))}

            <div className="mt-2 flex flex-col gap-3 border-t border-border pt-4">
              <SiteSearch
                placeholder={translateNavLabel(language, "Search")}
                onNavigate={navigateToSection}
              />

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground outline-none">
                    <Globe2 className="h-4 w-4" />
                    {language}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[88px]">
                    {languages.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleLanguageChange(option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />
              </div>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {translateNavLabel(language, "Dashboard")}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {translateNavLabel(language, "Sign In")}
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
