import { FeatureCard } from "@/components/ui/card";
import { MoveRight } from "lucide-react";

const infoData = [
    {
        title: "Best For Students",
        description: "Unlock specialized academic logic to simplify complex research, structure high distinction essays, and cut your study time in half. Build a superior knowledge base with precision engineered reasoning.",
        imageSrc: "/assets/student.png",
    },
    {
        title: "Best For Creators",
        description: "Gain full access to advanced creative frameworks designed to eliminate writer's block, streamline content production, and transform raw ideas into professional grade assets instantly.",
        imageSrc: "/assets/creator.png",
    },
    {
        title: "Best For Professionals",
        description: "The ultimate suite featuring institutional grade logic and a full commercial license. Engineered for those who need to scale business operations with priority execution and high stakes decision frameworks.",
        imageSrc: "/assets/professional.png",
        badge: "NEW",
    },
];

export default function Information() {
    return (
        <section className="bg-black py-24 px-6 sm:px-10">
            <div className="max-w-[1200px] mx-auto">

                {/* Header - Ukuran teks disesuaikan dengan foto web */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-white text-4xl md:text-[56px] font-bold tracking-tight leading-[1.1]">
                        Time To WIn
                    </h2>
                    <p className="text-[#a1a1aa] text-base md:text-lg max-w-lg mx-auto opacity-80">
                        The weapon for the top 1% of the population who's built to win.
                    </p>
                </div>

                {/* Grid Section - Gap rapat seperti di foto referensi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch relative">
                    {infoData.map((item, index) => (
                        <FeatureCard
                            key={index}
                            title={item.title}
                            description={item.description}
                            imageSrc={item.imageSrc}
                            badge={item.badge}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}