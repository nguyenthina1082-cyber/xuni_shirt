"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
  onRenameConversation: (id: number, newTitle: string) => void;
}

export function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConversations(data.data);
        }
      }
    } catch (error) {
      console.error("获取对话列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveEdit = async () => {
    if (editingId && editingTitle.trim()) {
      onRenameConversation(editingId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingTitle("");
    }
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors lg:hidden"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 z-30 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建对话
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">加载中...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                暂无对话记录
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-colors",
                      currentConversationId === conv.id
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>

                    {editingId === conv.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSaveEdit}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-2 py-1 text-sm bg-white border border-blue-400 rounded focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 truncate text-sm font-medium">{conv.title}</span>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(conv);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="重命名"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("确定要删除这个对话吗？")) {
                            onDeleteConversation(conv.id);
                          }
                        }}
                        className="p-1 hover:bg-red-100 text-red-500 rounded"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
