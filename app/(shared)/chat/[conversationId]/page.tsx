import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
            <h1 className="mb-4 text-2xl font-semibold text-(--text-primary)">Live chat</h1>
            <ChatWindow />
        </main>
    );
}
