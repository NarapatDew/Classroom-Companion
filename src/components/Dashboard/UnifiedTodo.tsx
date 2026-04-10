import React, { useState, useMemo } from 'react';
import type { Course, Assignment, Submission } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clock, AlertTriangle, CalendarDays, ExternalLink, Calendar } from 'lucide-react';

interface UnifiedTodoProps {
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
}

type FilterType = 'ALL' | 'TODAY' | '3DAYS' | '7DAYS';

const UnifiedTodo: React.FC<UnifiedTodoProps> = ({ courses, assignments, submissions }) => {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<FilterType>('ALL');

    // Parse and process assignments to enrich with submission and course data
    const enhancedAssignments = useMemo(() => {
        const now = new Date();

        return assignments.map(assignment => {
            // Find related course
            const course = courses.find(c => c.id === assignment.courseId);
            // Find related submission
            const submission = submissions.find(s => s.courseWorkId === assignment.id);

            const isTurnedIn = submission?.state === 'TURNED_IN' || submission?.state === 'RETURNED';

            let dueDateObj: Date | null = null;
            let daysUntilDue: number | null = null;
            let isPastDue = false;

            if (assignment.dueDate) {
                const hr = assignment.dueTime?.hours || 23;
                const min = assignment.dueTime?.minutes || 59;

                dueDateObj = new Date(Date.UTC(
                    assignment.dueDate.year,
                    assignment.dueDate.month - 1,
                    assignment.dueDate.day,
                    hr,
                    min
                ));

                const timeDiff = dueDateObj.getTime() - now.getTime();
                isPastDue = timeDiff < 0;

                // Better daysUntilDue logic using midnight comparisons (calendar days instead of math on raw time diffs)
                const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                const dueMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate()).getTime();
                daysUntilDue = Math.round((dueMidnight - todayMidnight) / (1000 * 3600 * 24));
            }

            return {
                ...assignment,
                courseName: course?.name || 'Unknown Course',
                isTurnedIn,
                dueDateObj,
                daysUntilDue,
                isPastDue,
                courseColor: (course?.name?.charCodeAt(0) ?? 0) % 5 || 0 // deterministic pseudo-random color class index
            };
        }).filter(a => !a.isTurnedIn); // Only show ones that are NOT turned in
    }, [assignments, courses, submissions]);

    // Apply filters
    const filteredAssignments = useMemo(() => {
        let filtered = enhancedAssignments;

        if (filter === 'TODAY') {
            filtered = enhancedAssignments.filter(a => a.daysUntilDue === 0);
        } else if (filter === '3DAYS') {
            filtered = enhancedAssignments.filter(a => a.daysUntilDue !== null && a.daysUntilDue >= 0 && a.daysUntilDue <= 3);
        } else if (filter === '7DAYS') {
            filtered = enhancedAssignments.filter(a => a.daysUntilDue !== null && a.daysUntilDue >= 0 && a.daysUntilDue <= 7);
        }

        // Include past due by default in all views unless it gets too much? 
        // We'll bring past due items to the top if they are missing
        if (filter !== 'ALL') {
            const pastDueList = enhancedAssignments.filter(a => a.isPastDue);
            filtered = [...pastDueList, ...filtered];
            // Remove duplicates (if any logic flaw)
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
        if (item.isPastDue) {
            return (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 font-bold text-xs px-2 py-0.5 rounded-full">
                    <AlertTriangle size={12} /> {t('todo.missing')}
                </span>
            );
        }
        if (item.daysUntilDue !== null) {
            if (item.daysUntilDue <= 1) {
                return (
                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 font-bold text-xs px-2 py-0.5 rounded-full">
                        <Clock size={12} /> {t('todo.urgent')}
                    </span>
                );
            } else if (item.daysUntilDue <= 3) {
                return (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 font-bold text-xs px-2 py-0.5 rounded-full">
                        <Calendar size={12} /> {t('todo.upcoming')}
                    </span>
                );
            }
        }
        return null;
    };

    const formatDueDate = (date: Date | null) => {
        if (!date) return language === 'th' ? 'ไม่มีกำหนดส่ง' : 'No due date';
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayDiff = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        const locale = language === 'th' ? 'th-TH' : 'en-US';
        const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        
        if (dayDiff === 0) {
            return language === 'th' ? `วันนี้ ${timeStr}` : `Today, ${timeStr}`;
        } else if (dayDiff === 1) {
            return language === 'th' ? `พรุ่งนี้ ${timeStr}` : `Tomorrow, ${timeStr}`;
        } else if (dayDiff === -1) {
            return language === 'th' ? `เมื่อวาน ${timeStr}` : `Yesterday, ${timeStr}`;
        }
        
        return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) + ', ' + timeStr;
    };

    const colorClasses = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700',
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <CalendarDays size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 tracking-tight">{t('todo.title')}</h3>
                </div>
                {/* Filters */}
                <div className="w-full mt-3 sm:mt-0 bg-gray-100/80 p-1 rounded-xl shadow-inner border border-gray-200/60">
                    <div className="flex w-full gap-1">
                        {[
                            { key: 'ALL', label: t('todo.filterAll') },
                            { key: 'TODAY', label: t('todo.filterToday') },
                            { key: '3DAYS', label: t('todo.filter3Days') },
                            { key: '7DAYS', label: t('todo.filter7Days') },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key as FilterType)}
                                className={`flex-1 px-1 sm:px-1.5 py-1 xl:py-1.5 text-[10px] xl:text-[11px] font-bold rounded-lg transition-all text-center select-none flex items-center justify-center min-h-[32px] ${filter === f.key ? 'bg-white text-blue-600 shadow-[0_1px_4px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.04]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/60'}`}
                            >
                                <span className="whitespace-normal leading-tight break-words">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                {filteredAssignments.length > 0 ? (
                    <div className="space-y-2">
                        {filteredAssignments.map((a) => (
                            <a
                                key={a.id}
                                href={a.alternateLink || '#'}
                                target={a.alternateLink ? "_blank" : undefined}
                                rel="noopener noreferrer"
                                className="flex flex-col bg-white border border-gray-100 p-3.5 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 group relative"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-[14px] leading-tight font-bold text-gray-800 group-hover:text-primary transition-colors pr-2 break-words" title={a.title}>
                                            {a.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${colorClasses[a.courseColor]} truncate max-w-[140px] sm:max-w-full`} title={a.courseName}>
                                                {a.courseName}
                                            </span>
                                            {getStatusBadge(a)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 text-right">
                                        <span className={`text-[11px] sm:text-xs font-semibold px-2 py-1 rounded-md border ${a.isPastDue ? 'text-red-600 border-red-100 bg-red-50' : 'text-gray-600 border-gray-100 bg-gray-50/80'} shadow-sm whitespace-nowrap`}>
                                            {formatDueDate(a.dueDateObj)}
                                        </span>
                                        
                                        <div className="mt-3 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded-md shadow-md">
                                            {t('todo.open')} <ExternalLink size={12} />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                            <CalendarDays size={32} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">{t('todo.noAssignments')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnifiedTodo;
