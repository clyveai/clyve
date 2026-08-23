"use client";

import { ArrowUp } from "lucide-react";
import { type FormEvent, useState } from "react";

export function ThesisComposer() {
  const [promptInput, setPromptInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex justify-center">
      <div className="w-full max-w-xl rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_10px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:max-w-3xl">
        <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-2">
          <input
            value={promptInput}
            onChange={(event) => setPromptInput(event.target.value)}
            placeholder="Research a stock, company, or SEC filing..."
            className="h-10 w-full bg-transparent px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:bg-zinc-200"
            aria-label="Submit prompt"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
