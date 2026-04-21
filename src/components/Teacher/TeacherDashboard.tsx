import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    AlertTriangle,
    LogOut,
    ChevronDown,
    Check,
    Search,
    BookOpen,
    Sparkles,
    LayoutDashboard,
    Target
} from 'lucide-react';
import {
    fetchCourses,
    fetchCourseStudents,
    fetchCourseWork,
    fetchTeacherSubmissions
} from '../../services/googleClassroom';
import type { Course, UserProfile } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';
import AtRiskPanel from './AtRiskPanel';

interface TeacherDashboardProps {
    onLogout: () => void;
    accessToken?: string;
    user?: UserProfile;
}

interface Assignment {
    id: string;
    title: string;
    dueDate: string;
    totalPoints: number;
    completionRate: number;
}

interface Student {
    id: string;
    name: string;
    avatarUrl: string;
    completedAssignmentsCount?: number;
    missingAssignmentsCount: number;
}

interface Submission {
    studentId: string;
    assignmentId: string;
    status: 'TURNED_IN' | 'MISSING' | 'LATE' | 'ASSIGNED';
    score?: number;
}

const StudentAvatar: React.FC<{ url: string; name: string; className?: string }> = ({ url, name, className }) => {
    const [imgSrc, setImgSrc] = useState(url);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(url);
        setHasError(false);
    }, [url]);

    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=random&color=fff&size=128`;

    return (
        <img
            src={hasError || !imgSrc ? fallbackUrl : imgSrc}
            alt={name}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, accessToken, user }) => {
    const { language, t } = useLanguage();
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        const loadRealData = async () => {
            if (!accessToken) return;
            try {
                const realCourses = await fetchCourses(accessToken, 'me');
                setCourses(realCourses);

                if (realCourses.length > 0) {
                    const firstCourseId = realCourses[0].id;
                    setActiveCourseId(firstCourseId);
                    await loadCourseData(accessToken, firstCourseId);
                }
            } catch (err) {
                console.error("Failed to load real data", err);
            }
        };
        loadRealData();
    }, [accessToken]);

    const loadCourseData = async (token: string, courseId: string) => {
        try {
            const [apiStudents, apiWork, apiSubs] = await Promise.all([
                fetchCourseStudents(token, courseId),
                fetchCourseWork(token, courseId),
                fetchTeacherSubmissions(token, courseId)
            ]);

            const realStudents: Student[] = apiStudents.map((s: any) => ({
                id: s.userId,
                name: s.profile?.name?.fullName || 'Unknown Student',
                avatarUrl: s.profile?.photoUrl
                    ? (s.profile.photoUrl.startsWith('http') ? s.profile.photoUrl : `https:${s.profile.photoUrl}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.profile?.name?.fullName || 'Student')}&background=random&color=fff&size=128`,
                missingAssignmentsCount: 0
            }));

            const realAssignments: Assignment[] = apiWork.map((w: any) => ({
                id: w.id,
                title: w.title,
                dueDate: w.dueDate ? `${w.dueDate.year}-${w.dueDate.month}-${w.dueDate.day}` : 'No Due Date',
                totalPoints: w.maxPoints || 100,
                completionRate: 0
            }));

            const realSubmissions: Submission[] = apiSubs.map(s => {
                let status: Submission['status'] = 'ASSIGNED';
                if (s.state === 'TURNED_IN' || s.state === 'RETURNED') status = 'TURNED_IN';
                else if (s.state === 'CREATED' || s.state === 'RECLAIMED_BY_STUDENT') {
                    status = 'MISSING';
                }

                return {
                    studentId: s.userId,
                    assignmentId: s.courseWorkId,
                    status: status,
                    score: s.assignedGrade
                };
            });

            const totalStudentsCount = realStudents.length;

            realAssignments.forEach(a => {
                const aSubs = realSubmissions.filter(s => s.assignmentId === a.id);
                const turnedInCount = aSubs.filter(s => s.status === 'TURNED_IN').length;
                a.completionRate = totalStudentsCount > 0 ? Math.round((turnedInCount / totalStudentsCount) * 100) : 0;
            });

            realStudents.forEach(s => {
                const sSubs = realSubmissions.filter(sub => sub.studentId === s.id);
                s.missingAssignmentsCount = sSubs.filter(sub => sub.status === 'MISSING').length;
                s.completedAssignmentsCount = sSubs.filter(sub => sub.status === 'TURNED_IN').length;
            });

            setStudents(realStudents);
            setAssignments(realAssignments);
            setSubmissions(realSubmissions);
        } catch (error) {
            console.error("Error loading course details", error);
        }
    };

    const stats = useMemo(() => {
        const totalStudents = students.length;
        if (totalStudents === 0) return { totalStudents: 0, atRiskCount: 0 };
        const atRiskCount = students.filter(s => s.missingAssignmentsCount >= 2).length;
        return { totalStudents, atRiskCount };
    }, [students]);

    const activeCourse = courses.find(c => c.id === activeCourseId);

    const handleCourseChange = (courseId: string) => {
        setActiveCourseId(courseId);
        setIsCourseMenuOpen(false);
        if (accessToken) {
            loadCourseData(accessToken, courseId);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-slate-800 antialiased">
            {/* SaaS Style Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 md:px-8 xl:px-6 py-4 sticky top-0 z-50 shadow-sm transition-all duration-300">
                <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto flex items-center justify-between gap-6">
                    
                    {/* Left: Branding & Course Switcher */}
                    <div className="flex items-center gap-8 flex-1 min-w-0">
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="relative">
                                <img src="/logos/dce_logo.png" alt="Logo" className="h-10 w-auto hover:opacity-90 transition-opacity" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="hidden lg:block min-w-0">
                                <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                                    {t('brand.name')}
                                </h1>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1.5 antialiased">Instructor Portal</p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-100 hidden md:block"></div>

                        {/* Modern Course Selector */}
                        <div className="relative group">
                            <button
                                onClick={() => setIsCourseMenuOpen(!isCourseMenuOpen)}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 group active:scale-95"
                            >
                                <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                                    <BookOpen size={16} />
                                </div>
                                <div className="flex flex-col text-left max-w-[180px] lg:max-w-[240px]">
                                    <span className="text-xs font-black text-slate-800 truncate">
                                        {activeCourse ? activeCourse.name : 'Select Course'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                        {activeCourse?.section ? `Sec ${activeCourse.section}` : 'Manage Classroom'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isCourseMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isCourseMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsCourseMenuOpen(false)} />
                                    <div className="absolute top-[calc(100%+12px)] left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-5 py-2 border-b border-slate-50 mb-2">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Quick Switch</h3>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto custom-scrollbar px-2">
                                            {courses.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleCourseChange(c.id)}
                                                    className={`w-full text-left px-3 py-3 my-1 rounded-xl transition-all flex items-center justify-between group ${activeCourseId === c.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeCourseId === c.id ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}`} />
                                                        <span className={`font-bold text-xs truncate ${activeCourseId === c.id ? 'text-emerald-800' : 'text-slate-600'}`}>{c.name}</span>
                                                    </div>
                                                    {activeCourseId === c.id && <Check size={14} className="text-emerald-600 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-5">
                        <LanguageToggle />
                        <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block text-right">
                                <p className="text-xs font-black text-slate-800 leading-none mb-1">{user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Instructor</p>
                            </div>
                            <div className="relative">
                                <img src={user?.photoUrl || `https://ui-avatars.com/api/?name=T&background=10b981&color=fff`} alt="Profile" className="w-10 h-10 rounded-2xl ring-4 ring-emerald-50 shadow-md object-cover" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                </div>
                            </div>
                            <button onClick={onLogout} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 hover:border-rose-100">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-10 xl:p-8 max-w-7xl 2xl:max-w-[1440px] mx-auto w-full space-y-10">
                
                {/* 1. Overview Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Metric Card: Students */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 border-b-4 border-b-indigo-500/50">
                        <div className="absolute -bottom-6 -right-6 text-indigo-500/5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
                            <Users size={160} />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl inline-flex mb-6 shadow-indigo-100 shadow-lg">
                                <LayoutDashboard size={24} />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{language === 'th' ? 'นักเรียนทั้งหมด' : 'Total Students'}</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{stats.totalStudents}</h3>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    {language === 'th' ? 'กำลังใช้งาน' : 'Synced'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metric Card: Attention */}
                    <div className={`p-8 rounded-[2rem] border relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-b-4 ${stats.atRiskCount > 0 ? 'bg-rose-50/50 border-rose-100 border-b-rose-500/50 hover:shadow-rose-500/5' : 'bg-white border-slate-100 border-b-slate-300/50'}`}>
                        <div className={`absolute -bottom-6 -right-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 ${stats.atRiskCount > 0 ? 'text-rose-500/5' : 'text-slate-500/5'}`}>
                            <AlertTriangle size={160} />
                        </div>
                        <div className="relative z-10">
                            <div className={`p-3 rounded-2xl inline-flex mb-6 shadow-lg ${stats.atRiskCount > 0 ? 'bg-rose-100 text-rose-600 shadow-rose-100' : 'bg-slate-100 text-slate-400 shadow-slate-100'}`}>
                                <Target size={24} />
                            </div>
                            <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 ${stats.atRiskCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                {language === 'th' ? 'สถานะการส่งงาน' : 'Attention Monitor'}
                            </p>
                            <div className="flex items-baseline gap-3">
                                <h3 className={`text-5xl font-black tracking-tighter ${stats.atRiskCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{stats.atRiskCount}</h3>
                                <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest whitespace-nowrap shadow-sm ${stats.atRiskCount > 0 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {language === 'th' ? 'นักเรียนที่ต้อดูแล' : 'Requires Focus'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. At-Risk Component */}
                <div className="w-full">
                    <AtRiskPanel students={students} assignments={assignments} submissions={submissions} />
                </div>

                {/* 3. Modern Data Table */}
                <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-br from-white to-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                                <Search size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg tracking-tighter leading-none">
                                    {language === 'th' ? 'รายชื่อนักเรียน' : 'Student Performance Grid'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Full course synchronization active</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            {students.length} Total Users
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/40">
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">{language === 'th' ? 'ชื่อนักเรียน' : 'Student Profile'}</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">{language === 'th' ? 'ความก้าวหน้า' : 'Work Progress'}</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">{language === 'th' ? 'ค้างส่ง' : 'Missing'}</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">{language === 'th' ? 'สถานะล่าสุด' : 'Current Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {students.map((student) => {
                                    const isAtRisk = student.missingAssignmentsCount >= 2;
                                    const completionPercentage = assignments.length > 0 ? Math.round(((student.completedAssignmentsCount || 0) / assignments.length) * 100) : 0;
                                    
                                    return (
                                        <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <StudentAvatar url={student.avatarUrl} name={student.name} className="w-10 h-10 rounded-2xl shadow-sm border border-slate-100 object-cover group-hover:scale-110 transition-transform" />
                                                    <span className="font-extrabold text-slate-800 text-sm">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 max-w-[140px] h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-700 ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                            style={{ width: `${completionPercentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                        {student.completedAssignmentsCount}/{assignments.length}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                {student.missingAssignmentsCount > 0 ? (
                                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-xl bg-rose-50 text-rose-600 font-extrabold text-xs shadow-sm border border-rose-100 animate-pulse">
                                                        {student.missingAssignmentsCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-black text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {isAtRisk ? (
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-[11px] font-black border border-orange-100 uppercase tracking-wider shadow-sm">
                                                        <AlertTriangle size={12} />
                                                        {language === 'th' ? 'ต้องติดตาม' : 'Intervention'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-100 uppercase tracking-wider shadow-sm">
                                                        <Sparkles size={12} />
                                                        {language === 'th' ? 'ปกติ' : 'Stable'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
