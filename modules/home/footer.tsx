import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:flex-row sm:text-left">
        {/* Left: copyright */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {year} VibeCode Editor. All rights reserved.
        </p>

        {/* Middle: authorship */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Designed &amp; built by{" "}
          <span className="bg-[linear-gradient(115deg,#fde68a,#f59e0b_50%,#d97706)] bg-clip-text font-bold text-transparent">
            Shash
          </span>{" "}
          · 2026
        </p>

        {/* Right: legal + social */}
        <div className="flex items-center gap-5 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            Privacy
          </Link>
          <Link href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
            Terms
          </Link>
          <Link
            href="https://github.com/Shash-04"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Github className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
