import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import type { UserProfile, Course, Assignment, Submission } from '../../types';
import { fetchCourses, fetchAllAssignments, fetchAllSubmissions } from '../../services/googleClassroom';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardProps {
    user: UserProfile;
    accessToken: string;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, accessToken, onLogout }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { language, t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;

            try {
                setLoading(true);
                setError(null);
                // Real API Fetch
                const fetchedCourses = await fetchCourses(accessToken);
                setCourses(fetchedCourses);

                if (fetchedCourses.length > 0) {
                    const [fetchedAssignments, fetchedSubmissions] = await Promise.all([
                        fetchAllAssignments(accessToken, fetchedCourses),
                        fetchAllSubmissions(accessToken, fetchedCourses)
                    ]);
                    setAssignments(fetchedAssignments);
                    setSubmissions(fetchedSubmissions);
                } else {
                    setAssignments([]);
                    setSubmissions([]);
                }

            } catch (err: any) {
                console.error('Failed to fetch dashboard data', err);
                const apiMessage = err.response?.data?.error?.message || err.message;
                const apiStatus = err.response?.status;
                setError(`(${apiStatus}) ${apiMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accessToken]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted font-sans font-medium text-sm">{t('dashboard.syncing')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-card border border-red-200 max-w-md w-full text-center">
                    <div className="text-red-500 font-bold mb-2">{t('dashboard.connectionError')}</div>
                    <p className="text-sm text-muted mb-4">{error}</p>
                    <button onClick={onLogout} className="text-primary hover:underline text-sm">{t('dashboard.returnToLogin')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className='relative'>
            {courses.length === 0 && (
                <div className="bg-white border border-yellow-200 p-8 text-center mb-4 mx-6 mt-6 rounded shadow-sm">
                    <h3 className="text-lg font-medium text-text mb-2">{t('dashboard.noCourses')}</h3>
                    <p className="text-muted text-sm max-w-md mx-auto">
                        {language === 'th'
                            ? <>ไม่พบรายวิชาที่เปิดใช้งานสำหรับบัญชี <strong>{user.email}</strong></>
                            : <>We couldn't find any active courses for <strong>{user.email}</strong>.</>}
                    </p>
                    <div className="mt-4 text-xs text-muted">
                        {language === 'th'
                            ? 'คำแนะนำ: ตรวจสอบว่าใช้บัญชีถูกต้องและมีการลงทะเบียนอย่างน้อย 1 รายวิชา'
                            : 'Tip: Make sure you are using the correct account and are enrolled in at least one course.'}
                    </div>
                    <button onClick={onLogout} className="mt-6 text-primary hover:underline text-sm">
                        {language === 'th' ? 'เข้าสู่ระบบด้วยบัญชีอื่น' : 'Sign in with a different account'}
                    </button>
                </div>
            )}
            {courses.length > 0 && (
                <DashboardLayout user={user} courses={courses} assignments={assignments} submissions={submissions} onLogout={onLogout} />
            )}
        </div>
    );
};

export default Dashboard;
