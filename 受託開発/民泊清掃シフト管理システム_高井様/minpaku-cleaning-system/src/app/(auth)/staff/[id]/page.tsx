"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    CheckCircle2,
    XCircle,
    Calendar,
    MapPin,
    Loader2,
    Building2,
    Clock,
    Banknote,
    Pencil,
    X,
    Check
} from "lucide-react";

interface Property {
    id: string;
    name: string;
    address: string;
}

interface CleaningTask {
    id: string;
    cleaningDate: string;
    checkoutTime: string;
    status: string;
    cleaningFee: number;
    property: {
        id: string;
        name: string;
        address: string;
    };
}

interface StaffDetail {
    id: string;
    name: string;
    phone: string | null;
    lineUserId: string | null;
    isActive: boolean;
    createdAt: string;
    cleaningTasks: CleaningTask[];
    propertyAssignments: {
        property: {
            id: string;
            name: string;
        };
    }[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "未割当", color: "bg-slate-100 text-slate-600" },
    notifying: { label: "打診中", color: "bg-amber-50 text-amber-600" },
    confirmed: { label: "確定", color: "bg-emerald-50 text-emerald-600" },
    completed: { label: "完了", color: "bg-sky-50 text-sky-600" },
    cancelled: { label: "キャンセル", color: "bg-red-50 text-red-600" },
};

export default function StaffDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [staff, setStaff] = useState<StaffDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 担当物件編集用
    const [isEditingProperties, setIsEditingProperties] = useState(false);
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch(`/api/staff/${params.id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError("スタッフが見つかりません");
                    } else {
                        setError("データの取得に失敗しました");
                    }
                    return;
                }
                const data = await res.json();
                setStaff(data);
                setSelectedPropertyIds(data.propertyAssignments.map((a: any) => a.property.id));
            } catch (err) {
                console.error("Error fetching staff:", err);
                setError("データの取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchStaff();
        }
    }, [params.id]);

    const fetchAllProperties = async () => {
        try {
            const res = await fetch("/api/properties");
            if (res.ok) {
                const data = await res.json();
                setAllProperties(data);
            }
        } catch (err) {
            console.error("Error fetching properties:", err);
        }
    };

    const handleEditProperties = async () => {
        if (allProperties.length === 0) {
            await fetchAllProperties();
        }
        setIsEditingProperties(true);
    };

    const handleCancelEdit = () => {
        setIsEditingProperties(false);
        if (staff) {
            setSelectedPropertyIds(staff.propertyAssignments.map((a) => a.property.id));
        }
    };

    const handleSaveProperties = async () => {
        if (!staff) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/staff/${staff.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyIds: selectedPropertyIds }),
            });

            if (res.ok) {
                const updatedStaff = await res.json();
                setStaff({
                    ...staff,
                    propertyAssignments: updatedStaff.propertyAssignments,
                });
                setIsEditingProperties(false);
                showToast("担当物件を更新しました", "success");
            } else {
                showToast("更新に失敗しました", "error");
            }
        } catch (err) {
            console.error("Error saving properties:", err);
            showToast("更新に失敗しました", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleProperty = (propertyId: string) => {
        setSelectedPropertyIds((prev) =>
            prev.includes(propertyId)
                ? prev.filter((id) => id !== propertyId)
                : [...prev, propertyId]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !staff) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-slate-600 font-medium mb-4">{error || "エラーが発生しました"}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        戻る
                    </button>
                </div>
            </div>
        );
    }

    const confirmedTasks = staff.cleaningTasks.filter(t => t.status === "confirmed");
    const completedTasks = staff.cleaningTasks.filter(t => t.status === "completed");
    const otherTasks = staff.cleaningTasks.filter(t => !["confirmed", "completed"].includes(t.status));

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in space-y-8">
            {/* ヘッダー */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-800">スタッフ詳細</h1>
                    <p className="text-slate-500 text-sm mt-0.5">担当案件とスタッフ情報</p>
                </div>
            </div>

            {/* スタッフ情報カード */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0">
                        {staff.name.slice(0, 1)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-800">{staff.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Phone className="w-4 h-4" />
                                <span>{staff.phone || "電話番号未登録"}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${staff.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                {staff.isActive ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        稼働中
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-3.5 h-3.5" />
                                        停止中
                                    </>
                                )}
                            </span>
                            {staff.lineUserId ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#06C755]/10 text-[#06C755]">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    LINE連携済み
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-400">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    LINE未連携
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 担当物件 */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">担当物件</h3>
                        {!isEditingProperties ? (
                            <button
                                onClick={handleEditProperties}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                                編集
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSaveProperties}
                                    disabled={saving}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    保存
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditingProperties ? (
                        <div className="space-y-2">
                            {allProperties.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {allProperties.map((property) => (
                                        <button
                                            key={property.id}
                                            onClick={() => toggleProperty(property.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedPropertyIds.includes(property.id)
                                                    ? "border-sky-500 bg-sky-50"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedPropertyIds.includes(property.id)
                                                    ? "bg-sky-500 text-white"
                                                    : "bg-slate-200"
                                                }`}>
                                                {selectedPropertyIds.includes(property.id) && (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{property.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{property.address}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {allProperties.length > 0 && (
                                <p className="text-xs text-slate-500 mt-2">
                                    {selectedPropertyIds.length}件選択中
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {staff.propertyAssignments.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {staff.propertyAssignments.map((assignment) => (
                                        <Link
                                            key={assignment.property.id}
                                            href={`/properties/${assignment.property.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition-colors"
                                        >
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            {assignment.property.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">担当物件が設定されていません</p>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 担当タスク一覧 */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    マッチング中の案件
                    <span className="text-sm font-normal text-slate-500">（{staff.cleaningTasks.length}件）</span>
                </h2>

                {staff.cleaningTasks.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">担当している案件はありません</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {confirmedTasks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    確定済み（{confirmedTasks.length}件）
                                </h3>
                                <div className="space-y-2">
                                    {confirmedTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} formatDate={formatDate} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {otherTasks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-amber-600 mb-2 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    その他（{otherTasks.length}件）
                                </h3>
                                <div className="space-y-2">
                                    {otherTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} formatDate={formatDate} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {completedTasks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-sky-600 mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    完了済み（{completedTasks.length}件）
                                </h3>
                                <div className="space-y-2">
                                    {completedTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} formatDate={formatDate} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function TaskCard({ task, formatDate }: { task: CleaningTask; formatDate: (date: string) => string }) {
    const status = statusLabels[task.status] || { label: task.status, color: "bg-slate-100 text-slate-600" };

    return (
        <Link
            href={`/tasks/${task.id}`}
            className="block bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
                            {status.label}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{formatDate(task.cleaningDate)}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 truncate">{task.property.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {task.property.address}
                        </span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {task.checkoutTime}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700 mt-1">
                        <Banknote className="w-3.5 h-3.5" />
                        ¥{task.cleaningFee.toLocaleString()}
                    </div>
                </div>
            </div>
        </Link>
    );
}
