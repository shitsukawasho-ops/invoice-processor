"use client";

import {
    HelpCircle,
    MessageCircle,
    Calendar,
    Users,
    Building2,
    Settings,
    CheckCircle2,
    AlertCircle,
    Mail,
    ArrowRight,
    Clock
} from "lucide-react";

export default function HelpPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in space-y-12 pb-20">
            {/* ヘッダー */}
            <div>
                <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-3">
                    <HelpCircle className="w-8 h-8 text-sky-500" />
                    ヘルプ・使い方ガイド
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    民泊清掃シフト管理システムの基本的な使い方と設定方法について説明します。
                </p>
            </div>

            {/* 目次 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TableOfContentsItem icon={MessageCircle} title="LINE連携の設定" href="#line-setup" />
                <TableOfContentsItem icon={Mail} title="自動予約取り込み" href="#auto-import" />
                <TableOfContentsItem icon={Users} title="スタッフの管理" href="#staff-management" />
                <TableOfContentsItem icon={Building2} title="物件の登録" href="#property-management" />
                <TableOfContentsItem icon={Calendar} title="清掃タスクの流れ" href="#task-flow" />
                <TableOfContentsItem icon={Clock} title="通知のタイミング" href="#notification-timing" />
                <TableOfContentsItem icon={Settings} title="各種設定" href="#settings" />
            </div>

            {/* セクション: LINE連携の設定 */}
            <section id="line-setup" className="scroll-mt-24 space-y-6">
                <SectionHeader icon={MessageCircle} title="LINE連携の設定" color="text-[#06C755]" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                    <p className="text-slate-600 leading-relaxed">
                        スタッフへの清掃依頼通知をLINEで送信するために、LINE公式アカウントとの連携が必要です。
                    </p>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">1</span>
                            LINE Developersでの設定
                        </h3>
                        <div className="pl-8 space-y-2 text-slate-600 text-sm">
                            <p>1. <a href="https://developers.line.biz/" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">LINE Developersコンソール</a>にログインします。</p>
                            <p>2. 新規プロバイダーを作成し、Messaging APIチャネルを作成します。</p>
                            <p>3. <strong>Channel Access Token (長期)</strong>を発行します。</p>
                            <p>4. <strong>Channel Secret</strong>を確認します。</p>
                            <p>5. <strong>Webhook URL</strong>に <code>https://[あなたのドメイン]/api/line/webhook</code> を設定し、「Webhookの利用」を有効にします。</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">2</span>
                            システムへの登録
                        </h3>
                        <div className="pl-8 space-y-2 text-slate-600 text-sm">
                            <p>1. サイドバーの「設定」メニューを開きます。</p>
                            <p>2. 「LINE連携設定」セクションに、取得したアクセストークンとシークレットを入力します。</p>
                            <p>3. 「保存」ボタンをクリックします。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* セクション: 自動予約取り込み */}
            <section id="auto-import" className="scroll-mt-24 space-y-6">
                <SectionHeader icon={Mail} title="自動予約取り込み（AirHost連携）" color="text-indigo-500" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                    <p className="text-slate-600 leading-relaxed">
                        AirHostなどの予約管理システムからの通知メールを解析し、自動的に清掃タスクを作成します。
                    </p>

                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            仕組み
                        </h4>
                        <p className="text-sm text-indigo-700">
                            システムは定期的に指定されたGmailアカウントをチェックし、件名に「予約」「確定」などが含まれるメールを解析します。<br />
                            物件名とチェックアウト日を抽出し、該当する物件の清掃タスクを自動作成します。
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800">設定手順</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm pl-4">
                            <li>Google Cloud ConsoleでGmail APIを有効にします。</li>
                            <li>OAuth 2.0クライアントIDを作成し、リフレッシュトークンを取得します。</li>
                            <li>設定画面の「AirHost連携設定」に各トークンを入力して保存します。</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* セクション: スタッフの管理 */}
            <section id="staff-management" className="scroll-mt-24 space-y-6">
                <SectionHeader icon={Users} title="スタッフの管理" color="text-sky-500" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">スタッフの登録方法</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                スタッフはLINE公式アカウントを友だち追加することで登録を開始できます。
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm bg-slate-50 p-4 rounded-xl">
                                <li>スタッフがLINE公式アカウントを友だち追加</li>
                                <li>自動応答メッセージに従い、名前を入力</li>
                                <li>ふりがなを入力</li>
                                <li>電話番号を入力</li>
                                <li>登録完了！管理画面に表示されます</li>
                            </ol>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">担当物件の割り当て</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                スタッフに担当物件を割り当てることで、その物件の清掃依頼が自動的に通知されるようになります。
                            </p>
                            <div className="text-slate-600 text-sm space-y-2">
                                <p>1. スタッフ一覧から対象スタッフの「詳細」をクリック</p>
                                <p>2. 「担当物件」セクションの「編集」ボタンをクリック</p>
                                <p>3. 担当させたい物件にチェックを入れる</p>
                                <p>4. 「保存」をクリック</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* セクション: 物件の登録 */}
            <section id="property-management" className="scroll-mt-24 space-y-6">
                <SectionHeader icon={Building2} title="物件の登録" color="text-amber-500" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                    <p className="text-slate-600 leading-relaxed">
                        管理する民泊物件を登録します。ここで登録した「物件名」は、予約メールからの自動マッチングに使用されるため、
                        <strong>予約サイトやAirHost上の名称と一致（または一部一致）させる必要があります。</strong>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard label="物件名" value="予約メールに含まれる名称を入力してください" />
                        <InfoCard label="住所" value="スタッフへの通知に表示されます" />
                        <InfoCard label="清掃料金" value="スタッフへの報酬額（税込）を設定します" />
                        <InfoCard label="チェックアウト時間" value="清掃開始可能時間の目安になります" />
                    </div>
                </div>
            </section>

            {/* セクション: 清掃タスクの流れ */}
            <section id="task-flow" className="scroll-mt-24 space-y-6">
                <SectionHeader icon={Calendar} title="清掃タスクの流れ" color="text-emerald-500" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="relative">
                        {/* フローチャート風表示 */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />

                        <div className="space-y-8 relative">
                            <FlowStep
                                step={1}
                                title="タスク作成（未割当）"
                                description="予約メールから自動作成、または手動で作成されます。この時点ではスタッフは決まっていません。"
                                status="pending"
                            />
                            <FlowStep
                                step={2}
                                title="通知・打診（打診中）"
                                description="担当物件として登録されているスタッフにLINEで一斉に依頼通知が送信されます。"
                                status="notifying"
                            />
                            <FlowStep
                                step={3}
                                title="受諾（確定）"
                                description="スタッフがLINEで「受諾する」ボタンを押すと、そのスタッフに確定します。他のスタッフには募集終了が通知されます。"
                                status="confirmed"
                            />
                            <FlowStep
                                step={4}
                                title="完了報告（完了）"
                                description="清掃終了後、スタッフまたは管理者が完了ステータスに変更します。"
                                status="completed"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* セクション: 通知のタイミング */}
            <section id="notification-timing" className="scroll-mt-24 space-y-6">
                <SectionHeader icon={Clock} title="通知のタイミング" color="text-amber-500" />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                    <p className="text-slate-600 leading-relaxed">
                        スタッフへの清掃依頼通知は、清掃予定日までの期間によって送信タイミングが異なります。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                1ヶ月以内の予約
                            </h3>
                            <p className="text-emerald-700 text-sm leading-relaxed">
                                予約が確定した時点で、<strong>即時に</strong>担当スタッフへLINE通知が送信されます。
                            </p>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                1ヶ月以上先の予約
                            </h3>
                            <p className="text-amber-700 text-sm leading-relaxed">
                                予約確定時には通知されません。<br />
                                <strong>清掃日の1ヶ月前</strong>になると、自動的にLINE通知が送信されます。
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-sm text-slate-600">
                            <strong>例：</strong> 2月15日の清掃予約が入った場合
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm text-slate-600 space-y-1 pl-2">
                            <li>予約日が1月10日なら → <strong>即時通知</strong>（1ヶ月以内のため）</li>
                            <li>予約日が12月5日なら → <strong>1月15日に通知</strong>（1ヶ月前になるまで待機）</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* フッター */}
            <div className="text-center pt-12 border-t border-slate-200">
                <p className="text-slate-500">
                    ご不明な点がございましたら、システム管理者までお問い合わせください。
                </p>
            </div>
        </div>
    );
}

function TableOfContentsItem({ icon: Icon, title, href }: { icon: any, title: string, href: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
        >
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-sky-500 transition-colors" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors">{title}</span>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
        </a>
    );
}

function SectionHeader({ icon: Icon, title, color }: { icon: any, title: string, color: string }) {
    return (
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <Icon className={`w-8 h-8 ${color}`} />
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
    );
}

function InfoCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-700 mb-1">{label}</h4>
            <p className="text-sm text-slate-500">{value}</p>
        </div>
    );
}

function FlowStep({ step, title, description, status }: { step: number, title: string, description: string, status: string }) {
    const statusColors: Record<string, string> = {
        pending: "bg-slate-100 text-slate-600",
        notifying: "bg-amber-50 text-amber-600",
        confirmed: "bg-emerald-50 text-emerald-600",
        completed: "bg-sky-50 text-sky-600",
    };

    return (
        <div className="flex gap-6">
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-2xl font-bold text-slate-300">{step}</span>
            </div>
            <div className="pt-2 pb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[status]}`}>
                        {status.toUpperCase()}
                    </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
