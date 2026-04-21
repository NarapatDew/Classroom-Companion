import React from 'react';
import type { UserProfile, Course, Assignment, Submission } from '../../types';
import ProgressRing from './ProgressRing';
import UnifiedTodo from './UnifiedTodo';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../common/LanguageToggle';

interface DashboardLayoutProps {
    user: UserProfile;
    courses: Course[];
    assignments: Assignment[];
    submissions: Submission[];
    onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, courses, assignments, submissions, onLogout }) => {
    const { language, t } = useLanguage();

    // Calculate Global Completion
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED').length;
    const globalCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Separate Active Courses
    const activeCourses = courses.filter(c => c.courseState === 'ACTIVE' || !c.courseState); // Default to active if undefined

    // Filter assignments: Only show assignments from Active Courses in the 'Upcoming' feed
    const activeCourseIds = new Set(activeCourses.map(c => c.id));
    const activeAssignments = assignments.filter(a => activeCourseIds.has(a.courseId));

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            {/* Department Header */}
            <header className="bg-white border-b border-border py-3 px-4 md:px-6 xl:px-4 sticky top-0 z-50 shadow-sm bg-gradient-to-r from-white via-orange-50/30 to-white">
                <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    {/* Branding */}
                    <div className="flex items-center gap-3 w-full md:w-auto mb-4 md:mb-0">
                        <img src="/logos/dce_logo.png" alt="Classroom Companion" className="h-10 w-auto hover:opacity-90 transition-opacity" />
                        <div className="min-w-0 flex flex-col justify-center">
                            <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">
                                {t('brand.name')}
                            </h1>
                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">{language === 'th' ? 'พื้นที่ของนักเรียน' : 'Student Workspace'}</p>
                        </div>
                    </div>
                    {/* User Profile */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <LanguageToggle />
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <button 
                            onClick={onLogout}
                            className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                            {t('dashboard.signOut')}
                        </button>
                        <div className="flex items-center gap-2 pl-2">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                            </div>
                            <img src={user.photoUrl} alt="Profile" className="w-9 h-9 rounded-full ring-2 ring-orange-100 shadow-sm object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 xl:p-5 max-w-6xl 2xl:max-w-7xl mx-auto w-full flex flex-col space-y-6">
                
                <div className="w-full max-w-5xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Unified Todo List */}
                        <div className="md:col-span-2 h-[600px]">
                            <UnifiedTodo courses={activeCourses} assignments={activeAssignments} submissions={submissions} />
                        </div>

                        {/* Global Progress */}
                        <div className="bg-white border border-border rounded-lg p-6 shadow-card flex flex-col items-center justify-center h-[600px]">
                            <h3 className="text-muted text-sm font-bold uppercase tracking-wider mb-8">{t('dashboard.overallProgress')}</h3>
                            <ProgressRing percentage={globalCompletion} color="#188038" size={180} strokeWidth={10} />
                            <p className="mt-10 text-center text-sm text-text font-medium">
                                {language === 'th' ? 'ทำได้ดีมาก รักษาความต่อเนื่องไว้!' : "You're doing great! Keep keeping up."}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
