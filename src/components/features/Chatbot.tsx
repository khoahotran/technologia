"use client";

import { MessageCircle, Minus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { env } from "@/config/env";
import { useLanguage } from "@/providers/language.provider";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";

type Sender = "user" | "bot";

interface Message {
    id: string;
    text: string;
    sender: Sender;
    timestamp: Date;
}

const HARD_CODED_QUICK_PROMPTS = [
    "chatbot_q1",
    "chatbot_q2",
    "chatbot_q3",
    "chatbot_q4",
] as const;

export function Chatbot() {
    const { t } = useLanguage();
    const { session } = useAuthStore();
    const customerId = session?.user.userId;

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => crypto.randomUUID());
    const scrollRef = useRef<HTMLDivElement>(null);

    const quickPrompts = useMemo(
        () =>
            HARD_CODED_QUICK_PROMPTS.map((key) =>
                t(
                    key,
                    {},
                    key === "chatbot_q1"
                        ? "Đơn hàng của tôi ở đâu?"
                        : key === "chatbot_q2"
                            ? "Chính sách đổi trả thế nào?"
                            : key === "chatbot_q3"
                                ? "Có được miễn phí ship không?"
                                : "So sánh iPhone 15 và iPhone 16"
                )
            ),
        [t]
    );

    const initialMessages = useMemo<Message[]>(
        () => [
            {
                id: "welcome-message",
                text: t(
                    "chatbot_welcome",
                    {},
                    "Chào bạn! Mình là Lạc Lạc, trợ lý AI từ Technologia. Bạn cần mình tư vấn sản phẩm hay hỗ trợ đơn hàng gì không?"
                ),
                sender: "bot",
                timestamp: new Date(),
            },
        ],
        [t]
    );

    const [messages, setMessages] = useState<Message[]>([]);
    const [mounted, setMounted] = useState(false);
    const showChatWindow = isOpen && !isMinimized;

    useEffect(() => {
        setMounted(true);
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen]);

    const callChatApi = async (message: string) => {
        try {
            const response = await fetch(`${env.aiAgentUrl}/api/agent/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: message,
                    customer_id: customerId || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch from AI service");
            }

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error("Chatbot API Error:", error);
            return t("chatbot_error", {}, "Rất tiếc, mình đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé!");
        }
    };

    const appendMessage = (text: string, sender: Sender) => {
        setMessages((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                text,
                sender,
                timestamp: new Date(),
            },
        ]);
    };

    const handleSendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        appendMessage(trimmed, "user");
        setInputValue("");
        setIsTyping(true);

        const reply = await callChatApi(trimmed);
        appendMessage(reply, "bot");
        setIsTyping(false);
    };

    const toggleChat = () => {
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
    };

    return (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-2 pointer-events-none">
            <Card
                className={cn(
                    "w-[calc(100vw-1rem)] max-w-[420px] sm:w-[380px] border-primary/20 shadow-2xl transition-all duration-300 py-0",
                    showChatWindow
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0 invisible"
                )}
            >
                <CardHeader className="rounded-t-lg bg-primary px-4 py-3 text-primary-foreground">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-semibold">Lạc Lạc</CardTitle>
                                <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                                    {t("chatbot_online", {}, "Trực tuyến")}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
                                onClick={() => setIsMinimized(true)}
                                aria-label={t("chatbot_minimize", {}, "Thu nhỏ chat")}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
                                onClick={() => setIsOpen(false)}
                                aria-label={t("chatbot_close", {}, "Đóng chat")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div ref={scrollRef} className="h-[360px] space-y-3 overflow-y-auto bg-accent/30 p-4 sm:h-[420px]">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[84%]",
                                    message.sender === "user"
                                        ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                                        : "mr-auto rounded-bl-md border bg-card text-card-foreground"
                                )}
                            >
                                <p>{message.text}</p>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-sm sm:max-w-[84%]">
                                <div className="flex gap-1">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"></span>
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground animate-pulse">Lạc Lạc đang suy nghĩ...</p>
                            </div>
                        )}
                    </div>

                    {messages.length <= 2 && (
                        <div className="flex flex-wrap gap-2 border-t bg-background px-4 py-3">
                            {quickPrompts.map((prompt) => (
                                <Button
                                    key={prompt}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-full border-primary/40 text-xs text-primary"
                                    onClick={() => handleSendMessage(prompt)}
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    )}

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSendMessage(inputValue);
                        }}
                        className="flex gap-2 border-t bg-background p-4"
                    >
                        <Input
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            placeholder={isTyping ? t("chatbot_thinking", {}, "Lạc Lạc đang suy nghĩ...") : t("chatbot_placeholder", {}, "Nhập tin nhắn...")}
                            className="h-10 flex-1"
                            disabled={isTyping}
                        />
                        <Button type="submit" size="icon" className="h-10 w-10" disabled={!inputValue.trim() || isTyping} aria-label={t("chatbot_send", {}, "Gửi")}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {isMinimized && (
                <Button
                    className="h-12 w-12 rounded-full bg-primary p-0 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
                    onClick={() => setIsMinimized(false)}
                    aria-label={t("chatbot_expand", {}, "Mở rộng chat")}
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
            )}

            {!isOpen && !isMinimized && (
                <Button
                    className="h-14 w-14 rounded-full bg-primary p-0 text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 pointer-events-auto"
                    onClick={toggleChat}
                    aria-label={t("chatbot_open", {}, "Mở chat")}
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
