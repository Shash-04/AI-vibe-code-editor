"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

import {
    Loader2,
    Send,
    User,
    Copy,
    Check,
    X,
    Code,
    Sparkles,
    MessageSquare,
    RefreshCw,
    Settings,
    Zap,
    Brain,
    Search,
    Filter,
    Download,
    FileInput,
    ShieldCheck,
    Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import "katex/dist/katex.min.css";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { findFilePath } from "@/modules/playground/lib";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

/** Flattens the template tree into a list of file paths for project context. */
const listFilePaths = (folder: TemplateFolder | null, prefix = ""): string[] => {
    if (!folder?.items) return [];
    const paths: string[] = [];
    for (const item of folder.items) {
        if ("folderName" in item) {
            paths.push(...listFilePaths(item, `${prefix}${item.folderName}/`));
        } else {
            paths.push(`${prefix}${item.filename}.${item.fileExtension}`);
        }
    }
    return paths;
};

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    id: string;
    timestamp: Date;
    type?: "chat" | "code_review" | "suggestion" | "error_fix" | "optimization";
    tokens?: number;
    model?: string;
}

interface AIChatSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_PROMPTS: {
    text: string;
    icon: React.ElementType;
    color: string;
}[] = [
    { text: "Review my React component for performance", icon: Code, color: "from-sky-500 to-cyan-400" },
    { text: "Fix TypeScript compilation errors", icon: RefreshCw, color: "from-rose-500 to-red-500" },
    { text: "Optimize database query performance", icon: Zap, color: "from-amber-500 to-yellow-400" },
    { text: "Add comprehensive error handling", icon: Sparkles, color: "from-fuchsia-500 to-purple-500" },
    { text: "Implement security best practices", icon: ShieldCheck, color: "from-emerald-500 to-teal-400" },
    { text: "Refactor code for better maintainability", icon: Wand2, color: "from-violet-500 to-indigo-500" },
];

const MessageTypeIndicator: React.FC<{
    type?: string;
    model?: string;
    tokens?: number;
}> = ({ type, model, tokens }) => {
    const getTypeConfig = (type?: string) => {
        switch (type) {
            case "code_review":
                return { icon: Code, color: "text-sky-400", label: "Code Review", bg: "bg-sky-500/10" };
            case "suggestion":
                return { icon: Sparkles, color: "text-fuchsia-400", label: "Suggestion", bg: "bg-fuchsia-500/10" };
            case "error_fix":
                return { icon: RefreshCw, color: "text-rose-400", label: "Error Fix", bg: "bg-rose-500/10" };
            case "optimization":
                return { icon: Zap, color: "text-amber-400", label: "Optimization", bg: "bg-amber-500/10" };
            default:
                return { icon: MessageSquare, color: "text-zinc-400", label: "Chat", bg: "bg-zinc-500/10" };
        }
    };

    const config = getTypeConfig(type);
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
            <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
                <span className={cn("text-xs font-medium", config.color)}>
                    {config.label}
                </span>
            </div>
            {(model || tokens) && (
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    {model && <span className="font-medium">{model}</span>}
                    {tokens && <span>{tokens.toLocaleString()} tokens</span>}
                </div>
            )}
        </div>
    );
};

/** A rich code block with a title bar, Copy, and Insert-into-file actions. */
const CodeBlock: React.FC<{
    code: string;
    language: string;
    onInsert: (code: string) => void;
}> = ({ code, language, onInsert }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success("Code copied");
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error("Failed to copy code");
        }
    };

    return (
        <div className="not-prose my-4 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-lg">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.03]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        {language || "code"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                        onClick={() => onInsert(code)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-white bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-sm shadow-fuchsia-500/25 transition-all"
                        title="Insert this code into the active file"
                    >
                        <FileInput className="h-3 w-3" />
                        Insert
                    </button>
                </div>
            </div>
            <pre className="text-sm text-zinc-100 overflow-x-auto p-4 leading-relaxed">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

export const AIChatSidePanel: React.FC<AIChatSidePanelProps> = ({
    isOpen,
    onClose,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatMode, setChatMode] = useState<
        "chat" | "review" | "fix" | "optimize"
    >("chat");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [autoSave, setAutoSave] = useState(true);
    const [streamResponse, setStreamResponse] = useState(true);
    const [model, setModel] = useState<string>("llama-3.1-8b-instant");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, isLoading]);

    // Insert a snippet into the currently active editor file. Reads the store
    // lazily on click so this component doesn't re-render as the user types.
    const insertIntoActiveFile = useCallback((code: string) => {
        const { activeFileId, openFiles, updateFileContent } =
            useFileExplorer.getState();

        if (!activeFileId) {
            toast.error("Open a file first to insert code into it");
            return;
        }
        const active = openFiles.find((f) => f.id === activeFileId);
        if (!active) {
            toast.error("No active file to insert into");
            return;
        }

        const base = active.content ?? "";
        const separator = base.length === 0 || base.endsWith("\n") ? "" : "\n";
        const newContent = `${base}${separator}${code}\n`;

        updateFileContent(activeFileId, newContent);
        toast.success(
            `Inserted into ${active.filename}.${active.fileExtension} — press Ctrl+S to save`
        );
    }, []);

    const getChatModePrompt = (mode: string, content: string) => {
        switch (mode) {
            case "review":
                return `Please review this code and provide detailed suggestions for improvement, including performance, security, and best practices:\n\n**Request:** ${content}`;
            case "fix":
                return `Please help fix issues in this code, including bugs, errors, and potential problems:\n\n**Problem:** ${content}`;
            case "optimize":
                return `Please analyze this code for performance optimizations and suggest improvements:\n\n**Code to optimize:** ${content}`;
            default:
                return content;
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const messageType =
            chatMode === "chat"
                ? "chat"
                : chatMode === "review"
                ? "code_review"
                : chatMode === "fix"
                ? "error_fix"
                : "optimization";

        const newMessage: ChatMessage = {
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
            id: Date.now().toString(),
            type: messageType,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const contextualMessage = getChatModePrompt(chatMode, input.trim());

            // Gather the current editor context so the assistant knows which
            // file/folder the user is working in and what the project contains.
            const { activeFileId, openFiles, templateData } =
                useFileExplorer.getState();
            const active = openFiles.find((f) => f.id === activeFileId);
            const activePath =
                active && templateData
                    ? findFilePath(active, templateData)
                    : active
                    ? `${active.filename}.${active.fileExtension}`
                    : null;

            const projectContext = {
                activeFile: activePath,
                activeFileContent: active?.content
                    ? active.content.slice(0, 8000)
                    : null,
                openFiles: openFiles.map(
                    (f) => `${f.filename}.${f.fileExtension}`
                ),
                files: listFilePaths(templateData).slice(0, 200),
            };

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: contextualMessage,
                    history: messages.slice(-10).map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    context: projectContext,
                    stream: streamResponse,
                    mode: chatMode,
                    model,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: data.response,
                        timestamp: new Date(),
                        id: Date.now().toString(),
                        type: messageType,
                        tokens: data.tokens,
                        model: data.model || "AI Assistant",
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "Sorry, I encountered an error while processing your request. Please try again.",
                        timestamp: new Date(),
                        id: Date.now().toString(),
                    },
                ]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "I'm having trouble connecting right now. Please check your internet connection and try again.",
                    timestamp: new Date(),
                    id: Date.now().toString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const exportChat = () => {
        const chatData = {
            messages,
            timestamp: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ai-chat-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredMessages = messages
        .filter((msg) => {
            if (filterType === "all") return true;
            return msg.type === filterType;
        })
        .filter((msg) => {
            if (!searchTerm) return true;
            return msg.content.toLowerCase().includes(searchTerm.toLowerCase());
        });

    const markdownComponents = {
        pre: ({ children }: any) => <>{children}</>,
        code({ children, className, ...props }: any) {
            const isBlock = className?.startsWith("language-");

            if (!isBlock) {
                return (
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-white/10 text-fuchsia-200">
                        {children}
                    </code>
                );
            }

            const language = className.replace("language-", "");
            const code = String(children).replace(/\n$/, "");

            return (
                <CodeBlock
                    code={code}
                    language={language}
                    onInsert={insertIntoActiveFile}
                />
            );
        },
    };

    return (
        <TooltipProvider>
            <>
                {/* Backdrop */}
                <div
                    className={cn(
                        "fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={onClose}
                />

                {/* Side Panel */}
                <div
                    className={cn(
                        "fixed right-0 top-0 h-full w-full max-w-6xl z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-out shadow-2xl",
                        "bg-[#0a0a0f] border-l border-white/10",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Ambient aurora glow */}
                    <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[42rem] rounded-full bg-linear-to-r from-violet-600/25 via-fuchsia-600/20 to-cyan-500/25 blur-[100px]" />
                    <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

                    {/* Header */}
                    <div className="relative shrink-0 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400 opacity-60 blur-md animate-pulse" />
                                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 via-fuchsia-600 to-cyan-500 shadow-lg">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight bg-linear-to-r from-violet-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                                        Enhanced AI Assistant
                                    </h2>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-400">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" />
                                        {messages.length} {messages.length === 1 ? "message" : "messages"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-all"
                                        >
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuCheckboxItem
                                            checked={autoSave}
                                            onCheckedChange={setAutoSave}
                                        >
                                            Auto-save conversations
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={streamResponse}
                                            onCheckedChange={setStreamResponse}
                                        >
                                            Stream responses
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={exportChat}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Chat
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setMessages([])}
                                            className="text-red-400 focus:text-red-400"
                                        >
                                            Clear All Messages
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="px-6 pb-5">
                            <div className="flex items-center justify-between gap-4">
                                <Tabs
                                    value={chatMode}
                                    onValueChange={(value) => setChatMode(value as any)}
                                    className="flex-1"
                                >
                                    <TabsList className="grid w-full grid-cols-4 gap-1 bg-white/[0.04] p-1 border border-white/5">
                                        {[
                                            { v: "chat", icon: MessageSquare, label: "Chat" },
                                            { v: "review", icon: Code, label: "Review" },
                                            { v: "fix", icon: RefreshCw, label: "Fix" },
                                            { v: "optimize", icon: Zap, label: "Optimize" },
                                        ].map(({ v, icon: Icon, label }) => (
                                            <TabsTrigger
                                                key={v}
                                                value={v}
                                                className="flex items-center gap-2 text-zinc-400 transition-all data-[state=active]:bg-linear-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fuchsia-500/20"
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">{label}</span>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-9 w-44 bg-white/[0.04] border-white/10 focus:border-fuchsia-500/50 transition-all"
                                        />
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 hover:bg-white/10 transition-all"
                                            >
                                                <Filter className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => setFilterType("all")}>
                                                All Messages
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterType("chat")}>
                                                Chat Only
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterType("code_review")}>
                                                Code Reviews
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterType("error_fix")}>
                                                Error Fixes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterType("optimization")}>
                                                Optimizations
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="relative flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {filteredMessages.length === 0 && !isLoading && (
                                <div className="text-center py-16">
                                    <div className="relative mx-auto mb-6 w-24 h-24">
                                        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400 opacity-40 blur-2xl animate-pulse" />
                                        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-violet-600/80 via-fuchsia-600/80 to-cyan-500/80 border border-white/10 shadow-xl">
                                            <Brain className="h-11 w-11 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-violet-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                                        Enhanced AI Assistant
                                    </h3>
                                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
                                        Advanced AI coding assistant with comprehensive analysis capabilities
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                        {QUICK_PROMPTS.map(({ text, icon: Icon, color }) => (
                                            <button
                                                key={text}
                                                onClick={() => setInput(text)}
                                                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-fuchsia-500/5"
                                            >
                                                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-white shadow-sm transition-transform group-hover:scale-110", color)}>
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="group-hover:text-zinc-100 transition-colors">
                                                    {text}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredMessages.map((msg) => (
                                <div key={msg.id} className="space-y-4">
                                    <div
                                        className={cn(
                                            "flex items-start gap-4 group",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 via-fuchsia-600 to-cyan-500 shadow-lg">
                                                <Sparkles className="h-5 w-5 text-white" />
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl shadow-lg transition-all",
                                                msg.role === "user"
                                                    ? "bg-linear-to-br from-violet-600 to-fuchsia-600 text-white p-4 rounded-br-md shadow-fuchsia-500/20"
                                                    : "bg-white/[0.04] backdrop-blur-sm text-zinc-100 p-5 rounded-bl-md border border-white/10"
                                            )}
                                        >
                                            {msg.role === "assistant" && (
                                                <MessageTypeIndicator
                                                    type={msg.type}
                                                    model={msg.model}
                                                    tokens={msg.tokens}
                                                />
                                            )}

                                            <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm, remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={markdownComponents}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Message actions */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                                                <div className="text-xs text-zinc-500 font-medium">
                                                    {msg.timestamp.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(msg.content);
                                                                toast.success("Message Copied Successfully");
                                                            } catch {
                                                                toast.error("Failed to copy message");
                                                            }
                                                        }}
                                                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>

                                                    {msg.role === "assistant" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => insertIntoActiveFile(msg.content)}
                                                            title="Insert entire message into the active file"
                                                            className="h-7 w-7 p-0 text-zinc-400 hover:text-fuchsia-300 hover:bg-white/10 transition-all"
                                                        >
                                                            <FileInput className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setInput(msg.content)}
                                                        title="Reuse this message as input"
                                                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all"
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {msg.role === "user" && (
                                            <Avatar className="h-10 w-10 border border-white/20 bg-linear-to-br from-violet-600 to-fuchsia-600 shrink-0 shadow-lg">
                                                <AvatarFallback className="bg-transparent text-white">
                                                    <User className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-4 justify-start">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 via-fuchsia-600 to-cyan-500 shadow-lg">
                                        <Sparkles className="h-5 w-5 text-white animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-fuchsia-400" />
                                        <span className="text-sm text-zinc-300">
                                            {chatMode === "review"
                                                ? "Analyzing code structure and patterns..."
                                                : chatMode === "fix"
                                                ? "Identifying issues and solutions..."
                                                : chatMode === "optimize"
                                                ? "Analyzing performance bottlenecks..."
                                                : "Processing your request..."}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="relative shrink-0 p-5 border-t border-white/10 bg-white/[0.02] backdrop-blur-xl"
                    >
                        <div className="flex items-end gap-3">
                            <div className="flex-1 relative">
                                <Textarea
                                    placeholder={
                                        chatMode === "chat"
                                            ? "Ask about your code, request improvements, or paste code to analyze..."
                                            : chatMode === "review"
                                            ? "Describe what you'd like me to review in your code..."
                                            : chatMode === "fix"
                                            ? "Describe the issue you're experiencing..."
                                            : "Describe what you'd like me to optimize..."
                                    }
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        // Enter sends; Shift+Enter inserts a newline.
                                        // Ignore Enter while composing (IME) input.
                                        if (
                                            e.key === "Enter" &&
                                            !e.shiftKey &&
                                            !e.nativeEvent.isComposing
                                        ) {
                                            e.preventDefault();
                                            handleSendMessage(e as any);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="min-h-12 max-h-32 bg-white/[0.04] border-white/10 text-zinc-100 placeholder-zinc-500 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 resize-none pr-24 rounded-xl transition-all"
                                    rows={1}
                                />
                                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-zinc-400 bg-white/5 border border-white/10 rounded shadow-sm">
                                        ↵ send &nbsp;·&nbsp; ⇧↵ newline
                                    </kbd>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="h-12 px-5 border-0 text-white bg-linear-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-fuchsia-500/30"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </>
        </TooltipProvider>
    );
};
