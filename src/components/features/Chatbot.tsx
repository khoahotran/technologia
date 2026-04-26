"use client";

import { MessageCircle, Minus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language.provider";
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
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const quickPrompts = useMemo(
        () =>
            HARD_CODED_QUICK_PROMPTS.map((key) =>
                t(
                    key,
                    {},
                    key === "chatbot_q1"
                        ? "Where is my order?"
                        : key === "chatbot_q2"
                            ? "What is the return policy?"
                            : key === "chatbot_q3"
                                ? "Is there free shipping?"
                                : "How to contact support?"
                )
            ),
        [t]
    );

    const autoResponseRules = useMemo(
        () => [
            {
                keywords: ["đơn hàng", "order"],
                response: t(
                    "chatbot_res_order",
                    {},
                    "You can track your order in Orders. If you share the order ID, I can guide the next step."
                ),
            },
            {
                keywords: ["đổi trả", "return"],
                response: t(
                    "chatbot_res_return",
                    {},
                    "We support returns within 30 days if the product is still in good condition."
                ),
            },
            {
                keywords: ["vận chuyển", "shipping"],
                response: t(
                    "chatbot_res_shipping",
                    {},
                    "Free shipping for orders over 1,000,000 VND. Standard shipping fee is 30,000 VND."
                ),
            },
            {
                keywords: ["liên hệ", "contact"],
                response: t(
                    "chatbot_res_contact",
                    {},
                    "You can reach support via support@technologia.com or (+84) 123 456 789."
                ),
            },
            {
                keywords: ["xin chào", "hello", "hi"],
                response: t(
                    "chatbot_res_greeting",
                    {},
                    "Hello! I'm Lạc Lạc, your Technologia assistant. How can I help?"
                ),
            },
            {
                keywords: ["tạm biệt", "bye"],
                response: t("chatbot_res_goodbye", {}, "Goodbye! Have a nice day."),
            },
        ],
        [t]
    );

    const initialMessages = useMemo<Message[]>(
        () => [
            {
                id: "welcome-message",
                text: t(
                    "chatbot_welcome",
                    {},
                    "Xin chào! Mình là Lạc Lạc - trợ lý của Technologia. Bạn cần mình hỗ trợ gì hôm nay?"
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

    const getAutoReply = (text: string) => {
        const normalized = text.toLowerCase();
        const matchedRule = autoResponseRules.find((rule) =>
            rule.keywords.some((keyword) => normalized.includes(keyword))
        );
        return matchedRule?.response ?? t("chatbot_res_default", {}, "Mình chưa hiểu rõ. Bạn có thể diễn đạt lại giúp mình nhé.");
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

    const handleSendMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        appendMessage(trimmed, "user");
        setInputValue("");

        window.setTimeout(() => {
            appendMessage(getAutoReply(trimmed), "bot");
        }, 500);
    };

    const toggleChat = () => {
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
    };

    return (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-2 pointer-events-none">
            <Card
                className={cn(
                    "w-[calc(100vw-1rem)] max-w-[420px] sm:w-[380px] border-primary/20 shadow-2xl transition-all duration-300",
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
                                    {t("chatbot_online", {}, "Online")}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
                                onClick={() => setIsMinimized(true)}
                                aria-label={t("chatbot_minimize", {}, "Minimize chat")}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
                                onClick={() => setIsOpen(false)}
                                aria-label={t("chatbot_close", {}, "Close chat")}
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
                            placeholder={t("chatbot_placeholder", {}, "Type a message...")}
                            className="h-10 flex-1"
                        />
                        <Button type="submit" size="icon" className="h-10 w-10" disabled={!inputValue.trim()} aria-label={t("chatbot_send", {}, "Send")}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {isMinimized && (
                <Button
                    className="h-12 w-12 rounded-full bg-primary p-0 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
                    onClick={() => setIsMinimized(false)}
                    aria-label={t("chatbot_expand", {}, "Expand chat")}
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
            )}

            {!isOpen && !isMinimized && (
                <Button
                    className="h-14 w-14 rounded-full bg-primary p-0 text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 pointer-events-auto"
                    onClick={toggleChat}
                    aria-label={t("chatbot_open", {}, "Open chat")}
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
