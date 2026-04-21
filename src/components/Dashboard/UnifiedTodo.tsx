import React, { useMemo, useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, Search, Inbox } from 'lucide-react';
import type { Course, Assignment, Submission } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface UnifiedTodoProps {
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
}

type FilterType = 'ALL' | 'TODAY' | 'SOON' | 'NO_DUE';

const UnifiedTodo: React.FC<UnifiedTodoProps> = ({ courses, assignments, submissions }) => {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<FilterType>('ALL');

    // Enhanced logic to merge assignments with course names and submission status
    const enhancedAssignments = useMemo(() => {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        return assignments.map(a => {
            const course = courses.find(c => c.id === a.courseId);
            const submission = submissions.find(s => s.courseWorkId === a.id);
            const isTurnedIn = submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED';

            let daysUntilDue: number | null = null;
            let isPastDue = false;
            let dueDateObj: Date | null = null;

            if (a.dueDate) {
                const hr = a.dueTime?.hours || 23;
                const min = a.dueTime?.minutes || 59;
                dueDateObj = new Date(Date.UTC(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day, hr, min));
                const dueMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate()).getTime();
                daysUntilDue = Math.round((dueMidnight - todayMidnight) / (1000 * 3600 * 24));
                isPastDue = dueDateObj.getTime() < now.getTime() && !isTurnedIn;
            }

            return {
                ...a,
                courseName: course?.name || 'Unknown Course',
                isTurnedIn,
                daysUntilDue,
                isPastDue,
                dueDateObj
            };
        });
    }, [assignments, courses, submissions]);

    // Apply filters
    const filteredAssignments = useMemo(() => {
        // Only show assignments that are NOT turned in
        const todoItems = enhancedAssignments.filter(a => !a.isTurnedIn);
        let filtered = todoItems;

        if (filter === 'TODAY') {
            filtered = todoItems.filter(a => a.daysUntilDue === 0);
        } else if (filter === 'SOON') {
            filtered = todoItems.filter(a => a.daysUntilDue !== null && a.daysUntilDue >= 0 && a.daysUntilDue <= 7);
        } else if (filter === 'NO_DUE') {
            filtered = todoItems.filter(a => a.dueDateObj === null);
        }

        if (filter !== 'ALL' && filter !== 'NO_DUE') {
            const pastDueList = todoItems.filter(a => a.isPastDue);
            filtered = [...pastDueList, ...filtered];
            filtered = Array.from(new Set(filtered));
        }

        // Sort: Past due first, then closest due date, then No due date
        return filtered.sort((a, b) => {
            if (a.isPastDue && !b.isPastDue) return -1;
            if (!a.isPastDue && b.isPastDue) return 1;
            if (a.dueDateObj && b.dueDateObj) return a.dueDateObj.getTime() - b.dueDateObj.getTime();
            if (a.dueDateObj) return -1;
            if (b.dueDateObj) return 1;
            return 0;
        });
    }, [enhancedAssignments, filter]);

    const getStatusBadge = (item: any) => {
        if (item.isTurnedIn) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100/50">
                    <CheckCircle2 size={12} />
                    {t('todo.turnedIn')}
                </span>
            );
        }
        if (item.isPastDue) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-100/50">
                    <AlertCircle size={12} />
                    {t('todo.missing')}
                </span>
            );
        }
        if (item.daysUntilDue !== null && item.daysUntilDue <= 2) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100/50">
                    <Clock size={12} />
                    {t('todo.urgent')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-100/50">
                <Calendar size={12} />
                {t('todo.upcoming')}
            </span>
        );
    };

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
            {/* Header Area */}
            <div className="p-5 md:px-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                        <Inbox size={18} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-800 text-lg tracking-tight leading-none">
                            {t('todo.title')}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{filteredAssignments.length} Assignments remaining</p>
                    </div>
                </div>

                <div className="flex items-center bg-slate-50/80 p-1 rounded-xl border border-slate-100">
                    {[
                        { key: 'ALL', label: t('todo.filterAll') },
                        { key: 'TODAY', label: t('todo.filterToday') },
                        { key: 'SOON', label: t('todo.filterSoon') },
                        { key: 'NO_DUE', label: t('todo.filterNoDue') },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as FilterType)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all uppercase ${
                                filter === f.key 
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-50/30">
                {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => window.open(item.alternateLink, '_blank')}
                            className="group w-full text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 transform hover:-translate-y-1 block"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            {item.courseName}
                                        </div>
                                        {getStatusBadge(item)}
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm sm:text-base">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                            <Calendar size={13} className="text-slate-300" />
                                            <span>
                                                {item.dueDate 
                                                    ? `${item.dueDate.day}/${item.dueDate.month}/${item.dueDate.year}`
                                                    : (language === 'th' ? 'ไม่มีกำหนด' : 'No due date')
                                                }
                                            </span>
                                        </div>
                                        {item.dueTime && (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                <Clock size={13} className="text-slate-300" />
                                                <span>{String(item.dueTime.hours).padStart(2, '0')}:{String(item.dueTime.minutes || 0).padStart(2, '0')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all self-center shadow-inner">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-100 p-8">
                        <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-300 animate-bounce">
                            <Search size={32} />
                        </div>
                        <p className="text-slate-800 font-extrabold text-lg tracking-tight mb-1">{t('todo.noAssignments')}</p>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{language === 'th' ? 'ไม่มีงานในช่วงเวลานี้' : 'Everything is captured'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnifiedTodo;
