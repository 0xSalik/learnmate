"use client";

import { useState } from "react";

export function ChatWindow() {
    const [messages, setMessages] = useState([
        { from: "Freelancer", body: "Hi! I saw your project. We can make this easy for Rohan." },
        { from: "Parent", body: "Thank you. He gets stuck after step 2 usually." },
    ]);
    const [draft, setDraft] = useState("");

    return (
        <div className="flex h-[70vh] flex-col rounded-2xl border border-(--border-subtle) bg-white">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((message, i) => (
                    <div key={i} className="rounded-xl bg-(--surface-warm) p-3 text-sm">
                        <p className="font-medium text-(--text-primary)">{message.from}</p>
                        <p className="text-(--text-secondary)">{message.body}</p>
                    </div>
                ))}
            </div>
            <div className="border-t border-(--border-subtle) p-3">
                <div className="flex gap-2">
                    <input
                        className="w-full rounded-xl border border-(--border-subtle) px-3 py-2"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type a message"
                    />
                    <button
                        className="rounded-xl bg-(--brand-primary) px-4 py-2 text-sm text-white"
                        onClick={() => {
                            if (!draft.trim()) return;
                            setMessages((prev) => [...prev, { from: "You", body: draft }]);
                            setDraft("");
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
