"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 w-full backdrop-blur-md z-50 border-b transition-all duration-300 ${
        isScrolled ? "bg-black/90 border-red-600" : "bg-black/70 border-transparent"
      } p-4 flex justify-between items-center`}
    >
      <h1 className="text-2xl font-bold text-red-500">AGORA</h1>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6">
        <a href="#features" className="hover:text-red-400 transition-colors duration-200">
          Features
        </a>
        <a href="#how" className="hover:text-red-400 transition-colors duration-200">
          How It Works
        </a>
        <a href="#chat" className="hover:text-red-400 transition-colors duration-200">
          Join
        </a>
      </div>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="text-white">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-[#121212] border-red-600 text-white">
          <div className="flex flex-col space-y-4 mt-8">
            <a href="#features" className="text-lg hover:text-red-400 transition-colors duration-200">
              Features
            </a>
            <a href="#how" className="text-lg hover:text-red-400 transition-colors duration-200">
              How It Works
            </a>
            <a href="#chat" className="text-lg hover:text-red-400 transition-colors duration-200">
              Join
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
