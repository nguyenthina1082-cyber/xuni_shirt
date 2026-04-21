"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";

interface User {
  id: number;
  email: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.success && data.user) {
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          window.location.href = "/login";
        }
      } catch {
        setIsLoggedIn(false);
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
          <p className="text-gray-500">加载中...</p>
        </div>
      </>
    );
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvatarLetter = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                  {getAvatarLetter(user.email)}
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{user.email.split('@')[0]}</h1>
                  <p className="text-blue-100 text-sm">会员</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">邮箱</span>
                  <span className="text-gray-900 font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">注册时间</span>
                  <span className="text-gray-900 font-medium">
                    {user.created_at ? formatDate(user.created_at) : "未知"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">账户状态</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    正常
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
