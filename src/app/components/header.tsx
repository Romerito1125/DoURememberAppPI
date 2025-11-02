"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

type NavItem = {
    label: string
    href: string
}

const navItems: NavItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/about" },
    { label: "Servicios", href: "/services" },
    { label: "Reportes", href: "/reports/baseline" },
    { label: "Contacto", href: "/contact" }
]

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link
                    href="/"
                    className="flex items-center space-x-3 text-2xl font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-200"
                >
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <Image
                            src="/loading.svg"
                            alt="Do U Remember Logo"
                            width={32}
                            height={32}
                            priority
                            className="text-purple-600"
                        />
                    </div>
                    <span className="hidden sm:block font-medium">Do U Remember</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-gray-600 font-medium text-sm tracking-wide hover:text-purple-600 transition-colors duration-200 relative group py-2"
                        >
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative w-10 h-10 flex flex-col justify-center items-center"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Abrir menú"
                >
                    <div className="w-6 h-5 relative flex flex-col justify-between">
                        <span
                            className={`block h-0.5 w-full bg-gray-600 transition-all duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-2" : ""
                                }`}
                        ></span>
                        <span
                            className={`block h-0.5 w-full bg-gray-600 transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : ""
                                }`}
                        ></span>
                        <span
                            className={`block h-0.5 w-full bg-gray-600 transition-all duration-300 ease-in-out ${isOpen ? "-rotate-45 -translate-y-2" : ""
                                }`}
                        ></span>
                    </div>
                </button>
            </div>

            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <nav className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-sm">
                    <div className="px-6 py-4 space-y-3">
                        {navItems.map((item, index) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block text-gray-600 font-medium text-base py-3 px-4 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 transform ${isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                                    }`}
                                style={{
                                    transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                                }}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
        </header>
    )
}