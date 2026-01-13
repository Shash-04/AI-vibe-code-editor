import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="z-20 flex min-h-screen flex-col items-center justify-start px-4 pt-2">

            <div className="flex flex-col items-center gap-6 text-center">
                <Image
                    src="/hero.svg"
                    alt="Hero-Section"
                    height={500}
                    width={500}
                    className="w-full max-w-md sm:max-w-lg"
                />

                <h1 className="z-20 max-w-4xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight bg-clip-text text-transparent bg-linear-to-r from-rose-500 via-red-500 to-pink-500 dark:from-rose-400 dark:via-red-400 dark:to-pink-400">
                    Vibe Code With Intelligence
                </h1>
            </div>
            <Link
                href="/dashboard"
                className="
    group mt-8 inline-flex items-center gap-2
    rounded-xl
   bg-linear-to-r from-rose-500 via-red-500 to-pink-500 dark:from-rose-400 dark:via-red-400 dark:to-pink-400
    px-9 py-3.5
    text-base sm:text-lg font-semibold text-white
    shadow-[0_0_0_0_rgba(99,102,241,0.0)]
    transition-all duration-300
    hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.8)]
    hover:scale-[1.02]
    active:scale-[0.98]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70
  "
            >
                Go to Dashboard
                <ArrowUpRight
                    className="
      h-4 w-4 shrink-0
      transition-transform duration-300
      group-hover:translate-x-0.5 group-hover:-translate-y-0.5
    "
                />
            </Link>



        </div>
    );
}
