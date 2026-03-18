import Hero from "@/components/sections/Hero"

export default function Home() {
    return (
        <>
            <Hero />

            {/* Features Section */}
            <section className="border-t border-border-DEFAULT bg-background-secondary py-20 md:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground-DEFAULT mb-4">
                            Why Choose Clyve AI?
                        </h2>
                        <p className="text-foreground-secondary max-w-2xl mx-auto">
                            Professional-grade tools for serious traders and investors
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Real-time Analysis",
                                description: "AI-powered sentiment tracking and market analysis updated in real-time",
                            },
                            {
                                title: "Risk Metrics",
                                description: "Comprehensive risk assessment tools to protect your portfolio",
                            },
                            {
                                title: "Multi-asset Support",
                                description: "Analyze stocks, crypto, commodities, and more in one platform",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-lg border border-border-DEFAULT bg-background-DEFAULT glass hover:border-border-light transition-all"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-4">
                                    <div className="w-6 h-6 bg-white/30 rounded" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground-DEFAULT mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-foreground-secondary">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="border-t border-border-DEFAULT bg-background-DEFAULT py-20 md:py-32">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground-DEFAULT mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-foreground-secondary mb-8 max-w-2xl mx-auto">
                        Join thousands of traders using Clyve AI for professional market intelligence
                    </p>
                    <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all">
                        Get Started Free
                    </button>
                </div>
            </section>
        </>
    )
}