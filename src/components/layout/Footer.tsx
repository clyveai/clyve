import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-border-DEFAULT bg-background-secondary">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground-DEFAULT mb-4">
                            Clyve AI
                        </h3>
                        <p className="text-sm text-foreground-tertiary">
                            Professional-grade market intelligence platform.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground-DEFAULT mb-4">
                            Product
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground-DEFAULT mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Community
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground-DEFAULT mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors">
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border-DEFAULT mb-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                    <p className="text-foreground-tertiary">
                        © {currentYear} Clyve AI. All rights reserved.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="#"
                            className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors"
                            aria-label="GitHub"
                        >
                            <Github size={18} />
                        </Link>
                        <Link
                            href="#"
                            className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter size={18} />
                        </Link>
                        <Link
                            href="#"
                            className="text-foreground-secondary hover:text-foreground-DEFAULT transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}