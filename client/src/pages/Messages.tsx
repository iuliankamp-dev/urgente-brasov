import { useState } from "react";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { getLoginUrl } from "@/const";

export default function Messages() {
  const { isAuthenticated } = useAuth();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: threads } = trpc.messages.threads.useQuery(undefined, { enabled: isAuthenticated });
  const { data: messages } = trpc.messages.byThread.useQuery(
    { threadId: selectedThread ?? "" },
    { enabled: !!selectedThread }
  );

  const utils = trpc.useUtils();
  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      utils.messages.byThread.invalidate({ threadId: selectedThread ?? "" });
    },
    onError: () => toast.error("Eroare la trimiterea mesajului"),
  });

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <a href={getLoginUrl()}><Button className="gradient-brand text-white border-0">Autentificare</Button></a>
        </div>
      </PublicLayout>
    );
  }

  const threadList = threads as Array<{ threadId: string; lastMessage: string; updatedAt: Date; otherUser?: { name?: string | null } | null; unreadCount?: number }> | undefined;

  return (
    <PublicLayout>
      <div className="container py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Mesaje</h1>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden" style={{ minHeight: 500 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full" style={{ minHeight: 500 }}>
            {/* Thread list */}
            <div className={`border-r border-gray-100 ${selectedThread ? "hidden md:block" : ""}`}>
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900">Conversații</p>
              </div>
              {threadList && threadList.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {threadList.map((thread) => (
                    <button
                      key={thread.threadId}
                      onClick={() => setSelectedThread(thread.threadId)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedThread === thread.threadId ? "bg-[oklch(0.94_0.01_25)]" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{thread.otherUser?.name ?? "Utilizator"}</p>
                          <p className="text-xs text-gray-500 truncate">{thread.lastMessage}</p>
                        </div>
                        {(thread.unreadCount ?? 0) > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[oklch(0.52_0.22_25)] text-white text-xs flex items-center justify-center flex-shrink-0">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nicio conversație</p>
                </div>
              )}
            </div>

            {/* Message view */}
            <div className={`md:col-span-2 flex flex-col ${!selectedThread ? "hidden md:flex" : "flex"}`}>
              {selectedThread ? (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button onClick={() => setSelectedThread(null)} className="md:hidden">
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <p className="font-semibold text-gray-900">Conversație</p>
                  </div>
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 380 }}>
                    {(messages as Array<{ id: number; content: string; senderId: number; createdAt: Date }> | undefined)?.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2 max-w-xs">
                          <p className="text-sm text-gray-800">{msg.content}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(msg.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Scrie un mesaj..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMessage.trim()) {
                          const parts = selectedThread.split("-");
                          const receiverId = parseInt(parts[1] ?? "0");
                          sendMutation.mutate({ receiverId, content: newMessage, threadId: selectedThread });
                        }
                      }}
                    />
                    <Button
                      className="gradient-brand text-white border-0"
                      onClick={() => {
                        if (!newMessage.trim()) return;
                        const parts = selectedThread.split("-");
                        const receiverId = parseInt(parts[1] ?? "0");
                        sendMutation.mutate({ receiverId, content: newMessage, threadId: selectedThread });
                      }}
                      disabled={sendMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Selectează o conversație</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
