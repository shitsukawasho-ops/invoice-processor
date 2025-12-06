"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  Send,
  Trash2,
  CheckCircle2,
  UserX,
  RefreshCw,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface TaskActionsProps {
  task: any;
  candidateStaff: any[];
}

export default function TaskActions({ task, candidateStaff }: TaskActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRecruitDialog, setShowRecruitDialog] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  // マッチングキャンセル確認
  const handleCancelClick = () => {
    setShowCancelConfirmDialog(true);
  };

  // マッチングキャンセル実行
  const handleCancelMatching = async () => {
    setShowCancelConfirmDialog(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: null, status: "pending" }),
      });
      if (!res.ok) throw new Error("Failed to cancel matching");

      // 再募集ダイアログを表示
      setShowRecruitDialog(true);
    } catch (error) {
      console.error(error);
      showToast("マッチングキャンセルに失敗しました", "error");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  // 再募集（全スタッフにLINE通知）
  const handleReRecruit = async () => {
    setLoading(true);
    setShowRecruitDialog(false);
    try {
      const res = await fetch(`/api/tasks/${task.id}/recruit`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to send recruitment notifications");
      showToast("全スタッフに募集通知を送信しました", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast("募集通知の送信に失敗しました", "error");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // 再募集しない
  const handleSkipReRecruit = () => {
    setShowRecruitDialog(false);
    router.refresh();
  };

  // 削除ダイアログを表示
  const handleDeleteClick = () => {
    setShowDeleteConfirmDialog(true);
  };

  // 削除実行
  const handleConfirmDelete = async () => {
    setShowDeleteConfirmDialog(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      router.push("/tasks");
    } catch (error) {
      console.error(error);
      showToast("タスクの削除に失敗しました", "error");
      setLoading(false);
    }
  };

  const isMatched = !!task.staff;
  const isRecruiting = task.status === 'recruiting';

  return (
    <>
      {/* キャンセル確認ダイアログ */}
      {showCancelConfirmDialog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                <UserX className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">マッチング解除</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                現在のスタッフ割り当てを解除します。<br />
                解除後、すぐに他のスタッフを募集できます。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirmDialog(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                キャンセル
              </button>
              <button
                onClick={handleCancelMatching}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "解除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 再募集確認ダイアログ */}
      {showRecruitDialog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-sky-50/50">
                <RefreshCw className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">スタッフを再募集</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                登録されている全スタッフにLINE通知を送信して、<br />再度清掃スタッフを募集しますか？
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkipReRecruit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                後でする
              </button>
              <button
                onClick={handleReRecruit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "募集する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">タスクを削除</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                本当にこのタスクを削除しますか？<br />
                <span className="text-red-500 font-medium">この操作は取り消せません。</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirmDialog(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 h-full flex flex-col">
        {isMatched ? (
          <div className="bg-green-50 border border-green-100 rounded-xl p-6 shadow-sm flex-grow flex flex-col justify-center items-center text-center">
            <div className="bg-white p-3 rounded-full shadow-sm mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">マッチング完了</h3>
            <p className="text-sm text-gray-600 mb-6">
              現在、担当スタッフが割り当てられています。
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleCancelClick}
                disabled={loading}
                className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3 px-4 rounded-lg border border-red-200 hover:border-red-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <UserX className="w-5 h-5" />
                割り当てを解除
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 font-bold py-3 px-4 rounded-lg border border-slate-200 hover:border-red-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
                このタスクを削除
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 shadow-sm flex-grow flex flex-col justify-center items-center text-center">
            <div className="bg-white p-3 rounded-full shadow-sm mb-4">
              <UserX className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">未マッチング</h3>
            <p className="text-sm text-gray-600 mb-6">
              現在、担当スタッフが決まっていません。<br />
              一斉募集を行ってください。
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={() => setShowRecruitDialog(true)}
                disabled={loading || isRecruiting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {isRecruiting ? "募集中..." : "一斉募集"}
                  </>
                )}
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 font-bold py-3 px-4 rounded-lg border border-slate-200 hover:border-red-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
                このタスクを削除
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

