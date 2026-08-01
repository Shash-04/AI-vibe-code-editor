"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const TEMPLATES = ["React", "Next.js", "Vue", "Angular", "Express", "Hono"];
const CMDS = ["git init", "vibe deploy", "npm i zustand"];

// Syntax-highlighted sample rendered as HTML so the JSX braces/tags don't fight
// the compiler. Static, author-controlled content only.
const CODE_HTML = `<span class="text-[#c084fc]">import</span> <span class="text-zinc-200">{ useState }</span> <span class="text-[#c084fc]">from</span> <span class="text-[#a5b4fc]">"react"</span>

<span class="text-[#c084fc]">export default function</span> <span class="text-amber-400">App</span>() {
  <span class="text-[#c084fc]">const</span> [<span class="text-zinc-200">vibes</span>, <span class="text-[#67e8f9]">setVibes</span>] = <span class="text-amber-400">useState</span>(<span class="text-[#fcd34d]">100</span>)
  <span class="text-[#c084fc]">return</span> <span class="text-[#67e8f9]">&lt;button</span> <span class="text-zinc-200">onClick</span>={() =&gt; <span class="text-[#67e8f9]">setVibes</span>(v =&gt; v+<span class="text-[#fcd34d]">1</span>)}<span class="text-[#67e8f9]">&gt;</span>
    <span class="text-zinc-200">Vibes: {vibes} 🔥</span>
  <span class="text-[#67e8f9]">&lt;/button&gt;</span>
}`;

function TypedCommand() {
  const [txt, setTxt] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTxt("git status");
      return;
    }
    let ci = 0;
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const word = CMDS[ci];
      setTxt(deleting ? word.slice(0, i--) : word.slice(0, i++));
      if (!deleting && i > word.length) {
        deleting = true;
        timer = setTimeout(tick, 1100);
        return;
      }
      if (deleting && i < 0) {
        deleting = false;
        i = 0;
        ci = (ci + 1) % CMDS.length;
      }
      timer = setTimeout(tick, deleting ? 45 : 95);
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return <span>{txt}</span>;
}

export default function Home() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-8">
      {/* warm gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 -z-10 h-[28rem] w-[46rem] max-w-full rounded-full bg-[radial-gradient(closest-side,rgba(217,119,6,0.18),transparent)] blur-2xl"
      />

      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.02fr_1.12fr]">
        {/* ---------- left: copy ---------- */}
        <div>
          <span className="inline-flex items-center gap-3 font-mono text-[13px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            <span className="h-px w-8 bg-[linear-gradient(115deg,#fde68a,#d97706)]" />
            AI-Powered Web IDE
          </span>

          <h1 className="mt-6 text-balance text-6xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Vibe code with{" "}
            <span className="bg-[linear-gradient(115deg,#fde68a,#f59e0b_50%,#d97706)] bg-clip-text text-transparent">
              real intelligence.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-xl text-muted-foreground">
            Spin up React, Next, Vue and more in your browser. Edit, run, and
            ship — with an AI that actually knows your code.
          </p>

          <div className="mt-10">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-[linear-gradient(115deg,#fde68a,#f59e0b_50%,#d97706)] px-9 py-4 text-lg font-bold text-zinc-950 shadow-[0_14px_34px_-10px_rgba(217,119,6,0.65)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-12px_rgba(217,119,6,0.8)] active:translate-y-0 active:scale-[0.99]"
            >
              <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent)] transition-transform duration-700 group-hover:translate-x-[120%]" />
              Go to Dashboard
              <ArrowRight className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2.5">
            {TEMPLATES.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-foreground/[0.02] px-3.5 py-2 font-mono text-sm font-semibold text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- right: editor window ---------- */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,#0e0e15,#0a0a10)] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] motion-safe:animate-[vibe-float_7s_ease-in-out_infinite]">
            {/* title bar */}
            <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3.5">
              <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
              <div className="ml-3 flex gap-0.5 font-mono text-[13px] font-semibold">
                <span className="rounded-t-lg bg-white/[0.06] px-3.5 py-1.5 text-zinc-100">
                  App.tsx
                </span>
                <span className="px-3.5 py-1.5 text-zinc-500">index.css</span>
              </div>
            </div>

            {/* code */}
            <div className="grid grid-cols-[46px_1fr] py-5 font-mono text-[15px] leading-[1.8]">
              <div className="select-none pr-4 text-right text-[#3a3f4b]">
                1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
              </div>
              <pre
                className="whitespace-pre-wrap text-zinc-200"
                dangerouslySetInnerHTML={{ __html: CODE_HTML }}
              />
            </div>

            {/* terminal */}
            <div className="min-h-[104px] border-t border-white/[0.07] bg-[#070709] px-5 py-4 font-mono text-[14px] leading-[1.8] text-zinc-300">
              <div>
                <span className="text-amber-400">~/vibe $</span> npm run dev
              </div>
              <div className="text-emerald-400">
                ✓ ready — local: http://localhost:3000
              </div>
              <div>
                <span className="text-amber-400">~/vibe $</span> <TypedCommand />
                <span className="ml-0.5 inline-block h-4 w-2 -translate-y-px bg-amber-400 align-middle motion-safe:animate-[vibe-blink_1s_steps(1)_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
