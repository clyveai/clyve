import { ThesisCaptureForm } from "@/modules/thesis/components/ThesisCaptureForm";

export default function NewThesisPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-primary)] px-4 py-24 text-white sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <ThesisCaptureForm />
      </div>
    </main>
  );
}
