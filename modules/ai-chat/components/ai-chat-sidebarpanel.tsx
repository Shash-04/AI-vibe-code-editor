"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

import {
    Loader2,
    Send,
    User,
    Copy,
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
import Image from "next/image";

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

const MessageTypeIndicator: React.FC<{
    type?: string;
    model?: string;
    tokens?: number;
}> = ({ type, model, tokens }) => {
    const getTypeConfig = (type?: string) => {
        switch (type) {
            case "code_review":
                return { icon: Code, color: "text-blue-400", label: "Code Review", bg: "bg-blue-500/10" };
            case "suggestion":
                return {
                    icon: Sparkles,
                    color: "text-purple-400",
                    label: "Suggestion",
                    bg: "bg-purple-500/10"
                };
            case "error_fix":
                return { icon: RefreshCw, color: "text-red-400", label: "Error Fix", bg: "bg-red-500/10" };
            case "optimization":
                return { icon: Zap, color: "text-yellow-400", label: "Optimization", bg: "bg-yellow-500/10" };
            default:
                return { icon: MessageSquare, color: "text-zinc-400", label: "Chat", bg: "bg-zinc-500/10" };
        }
    };

    const config = getTypeConfig(type);
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/50">
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

    return (
        <TooltipProvider>
            <>
                {/* Backdrop */}
                <div
                    className={cn(
                        "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
                        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={onClose}
                />

                {/* Side Panel */}
                <div
                    className={cn(
                        "fixed right-0 top-0 h-full w-full max-w-6xl bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 border-l border-zinc-800/50 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Enhanced Header */}
                    <div className="shrink-0 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="relative w-11 h-11 border-2 border-zinc-700/50 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg">
                                    <Image src={"/logo.svg"} alt="Logo" width={28} height={28} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-50 tracking-tight">
                                        Enhanced AI Assistant
                                    </h2>
                                    <p className="text-sm text-zinc-400 mt-0.5">
                                        {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className=" p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                                        >
                                            <Settings size={24} />
                                            
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
                                    size="sm"
                                    onClick={onClose}
                                    className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                                >
                                    <X size={256} />
                                </Button>
                            </div>
                        </div>

                        {/* Enhanced Controls */}
                        <div className="px-6 pb-5">
                            <div className="flex items-center justify-between gap-4">
                                <Tabs
                                    value={chatMode}
                                    onValueChange={(value) => setChatMode(value as any)}
                                    className="flex-1"
                                >
                                    <TabsList className="grid w-full grid-cols-4 bg-zinc-800/30 p-1">
                                        <TabsTrigger 
                                            value="chat" 
                                            className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 transition-all"
                                        >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Chat</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="review"
                                            className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 transition-all"
                                        >
                                            <Code className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Review</span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="fix" 
                                            className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 transition-all"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Fix</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="optimize"
                                            className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 transition-all"
                                        >
                                            <Zap className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Optimize</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-9 w-44 bg-zinc-800/30 border-zinc-700/50 focus:border-zinc-600 transition-all"
                                        />
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-9 w-9 p-0 hover:bg-zinc-800/50 transition-all"
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
                                            <DropdownMenuItem
                                                onClick={() => setFilterType("code_review")}
                                            >
                                                Code Reviews
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setFilterType("error_fix")}
                                            >
                                                Error Fixes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setFilterType("optimization")}
                                            >
                                                Optimizations
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto bg-linear-to-b from-zinc-950 to-zinc-900">
                        <div className="p-6 space-y-6">
                            {filteredMessages.length === 0 && !isLoading && (
                                <div className="text-center text-zinc-500 py-20">
                                    <div className="relative w-20 h-20 border-2 border-zinc-700/50 rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <Brain className="h-10 w-10 text-zinc-400" />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-2 text-zinc-200">
                                        Enhanced AI Assistant
                                    </h3>
                                    <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-8">
                                        Advanced AI coding assistant with comprehensive analysis
                                        capabilities
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                        {[
                                            "Review my React component for performance",
                                            "Fix TypeScript compilation errors",
                                            "Optimize database query performance",
                                            "Add comprehensive error handling",
                                            "Implement security best practices",
                                            "Refactor code for better maintainability",
                                        ].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setInput(suggestion)}
                                                className="px-4 py-3 bg-zinc-800/40 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-zinc-600 rounded-xl text-sm text-zinc-300 hover:text-zinc-100 transition-all text-left group"
                                            >
                                                <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                                                    {suggestion}
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
                                            <div className="relative w-10 h-10 border-2 border-zinc-700/50 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shrink-0 shadow-lg">
                                                <Brain className="h-5 w-5 text-zinc-400" />
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl shadow-lg transition-all",
                                                msg.role === "user"
                                                    ? "bg-linear-to-br from-blue-600 to-blue-700 text-white p-4 rounded-br-md"
                                                    : "bg-zinc-900/60 backdrop-blur-sm text-zinc-100 p-5 rounded-bl-md border border-zinc-800/50"
                                            )}
                                        >
                                            {msg.role === "assistant" && (
                                                <MessageTypeIndicator
                                                    type={msg.type}
                                                    model={msg.model}
                                                    tokens={msg.tokens}
                                                />
                                            )}

                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm, remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={{
                                                        code({ children, className, ...props }) {
                                                            const isBlock = className?.startsWith("language-");

                                                            if (!isBlock) {
                                                                return (
                                                                    <code className="bg-zinc-800/80 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-700/50">
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }

                                                            return (
                                                                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 my-4 shadow-inner">
                                                                    <pre className="text-sm text-zinc-100 overflow-x-auto">
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Message actions */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/30">
                                                <div className="text-xs text-zinc-500 font-medium">
                                                    {msg.timestamp.toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
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
                                                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setInput(msg.content)}
                                                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all"
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {msg.role === "user" && (
                                            <Avatar className="h-10 w-10 border-2 border-blue-500/50 bg-linear-to-br from-blue-600 to-blue-700 shrink-0 shadow-lg">
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
                                    <div className="relative w-10 h-10 border-2 border-zinc-700/50 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg">
                                        <Brain className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 p-5 rounded-2xl rounded-bl-md flex items-center gap-3 shadow-lg">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
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

                    {/* Enhanced Input Form */}
                    <form
                        onSubmit={handleSendMessage}
                        className="shrink-0 p-5 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
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
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                            handleSendMessage(e as any);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="min-h-12 max-h-32 bg-zinc-800/30 border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none pr-24 rounded-xl transition-all"
                                    rows={1}
                                />
                                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded shadow-sm">
                                        ⌘↵
                                    </kbd>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="h-12 px-5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
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