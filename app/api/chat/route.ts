export const runtime = "nodejs";
import { db } from "@/lib/db";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequest {
    message: string;
    history: ChatMessage[];
}

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
    const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

    const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

    const prompt = fullMessages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n\n");

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: fullMessages,
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 0.9,
            }),
        });

        const data = await response.json();

        const aiMessage = data?.choices?.[0]?.message?.content;

        if (!aiMessage) {
            throw new Error("No response from AI model");
        }

        return aiMessage.trim();

        return data.response.trim();
    } catch (error) {
        console.error("AI generation error:", error);
        throw new Error("Failed to generate AI response");
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequest = await req.json();
        const { message, history = [] } = body;

        // Validate input
        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required and must be a string" },
                { status: 400 }
            );
        }

        // Validate history format
        const validHistory = Array.isArray(history)
            ? history.filter(
                (msg) =>
                    msg &&
                    typeof msg === "object" &&
                    typeof msg.role === "string" &&
                    typeof msg.content === "string" &&
                    ["user", "assistant"].includes(msg.role)
            )
            : [];

        const recentHistory = validHistory.slice(-10);

        const messages: ChatMessage[] = [
            ...recentHistory,
            { role: "user", content: message },
        ];

        //   Generate ai response

        const aiResponse = await generateAIResponse(messages);



        return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Chat API Error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Failed to generate AI response",
                details: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}