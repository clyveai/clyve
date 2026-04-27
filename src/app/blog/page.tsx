import { Lock } from "lucide-react";
import { GeistSans } from 'geist/font/sans';

export default function BlogMainPage() {
  return (
    <main className={`${GeistSans.className} min-h-screen bg-[#030303] text-zinc-50 flex flex-col selection:bg-zinc-200 selection:text-black`}>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center pt-32 md:pt-44 pb-20 px-6 relative overflow-hidden">
        
        {/* Subtil Ambient Glow - Diperhalus agar tidak mengganggu teks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full text-center">
          
          {/* Icon Section - Lebih mungil & clean khas Shadcn */}
          <div className="flex justify-center mb-10">
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Exclusive Access Only
            </h1>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-md mx-auto font-light">
              The portal for <span className="text-zinc-200 font-medium">Students</span>, <span className="text-zinc-200 font-medium">Creators</span>, and <span className="text-zinc-200 font-medium">Professionals</span>.
            </p>
          </div>

          {/* Instructions Card - Menggunakan border zinc-800 khas Shadcn */}
          <div className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-[2rem] space-y-8 backdrop-blur-md">
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed tracking-tight">
              "Access is granted only via the unique encrypted links sent to your email after a successful purchase."
            </p>
            
            {/* Tag Grid - Lebih clean */}
            <div className="flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500">
              <span className="px-4 py-1.5 border border-zinc-800 bg-zinc-900/50 rounded-full">Student</span>
              <span className="px-4 py-1.5 border border-zinc-800 bg-zinc-900/50 rounded-full">Creator</span>
              <span className="px-4 py-1.5 border border-zinc-800 bg-zinc-900/50 rounded-full">Professional</span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="h-px w-12 bg-zinc-800" />
            <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">
              Haven&apos;t secured your access yet?
            </p>
            <a 
              href="/pricing"
              className="group relative inline-flex items-center justify-center px-8 py-3 bg-zinc-50 text-black text-sm font-medium rounded-full transition-all hover:bg-white active:scale-95 overflow-hidden"
            >
              Get Your Access Link
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}