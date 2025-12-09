import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { UserProfile } from '../../types';
import { fetchUserProfile } from '../../services/googleClassroom';
import TeacherDashboard from '../Teacher/TeacherDashboard';

interface LoginScreenProps {
    onLogin: (user: UserProfile, accessToken: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [showTeacherDemo, setShowTeacherDemo] = useState(false);
    const [isTeacherLogin, setIsTeacherLogin] = useState(false);
    const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null);
    const [teacherToken, setTeacherToken] = useState<string | null>(null);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const user = await fetchUserProfile(tokenResponse.access_token);
                if (isTeacherLogin) {
                    setTeacherToken(tokenResponse.access_token);
                    setTeacherProfile(user);
                    setShowTeacherDemo(true);
                } else {
                    onLogin(user, tokenResponse.access_token);
                }
            } catch (error) {
                console.error('Failed to fetch user profile', error);
                // For demo/hybrid purposes, maybe we allow entry or define behavior here.
                // Currently just logging error.
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.error('Login Failed');
            setLoading(false);
        },
        scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.student-submissions.students.readonly https://www.googleapis.com/auth/classroom.profile.photos',
    });

    const handleTeacherLogin = () => {
        setIsTeacherLogin(true);
        login();
    };

    if (showTeacherDemo) {
        return <TeacherDashboard user={teacherProfile!} accessToken={teacherToken || undefined} onLogout={() => { setShowTeacherDemo(false); setTeacherToken(null); setIsTeacherLogin(false); setTeacherProfile(null); }} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#e6fcf5] via-[#f0fdf4] to-[#ecfdf5]">
            {/* Ambient Background Blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">

                {/* Left Side: Branding & Logos */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center items-center text-center bg-gradient-to-br from-emerald-600 to-green-700 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="z-10 w-full flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-8">
                            <img src="/logos/kmutnb_logo.png" alt="KMUTNB" className="h-12 w-auto bg-white/20 rounded-full p-1 backdrop-blur-sm" />
                            <img src="/logos/fte_logo.png" alt="FTE" className="h-12 w-auto bg-white/20 rounded-full p-1 backdrop-blur-sm" />
                            <img src="/logos/dce_logo.png" alt="DCE" className="h-14 w-auto bg-white/20 rounded-full p-1 backdrop-blur-sm drop-shadow-md" />
                        </div>
                        <h1 className="text-3xl font-extrabold mb-2 leading-tight tracking-tight">
                            ภาควิชาคอมพิวเตอร์ศึกษา
                        </h1>
                        <h2 className="text-lg font-medium text-emerald-100 mb-6 font-sans">
                            Department of Computer Education
                        </h2>
                        <p className="text-sm text-emerald-50/80 leading-relaxed font-light">
                            Faculty of Technical Education<br />
                            King Mongkut's University of Technology North Bangkok
                        </p>
                    </div>

                    <div className="z-10 mt-12">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2">
                            System
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter shadow-sm">
                            CED E-Learning
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center md:text-left mb-10">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="text-gray-500 mt-2 text-sm">Please sign in to access your classroom.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Student Google Login */}
                        <button
                            onClick={() => login()}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md transition-all px-6 py-4 rounded-xl group relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold text-base">Sign in with Google</span>
                                </>
                            )}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Instructors</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Teacher/Instructor Portal Button */}
                        <button
                            onClick={handleTeacherLogin}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-800 to-green-900 text-white hover:from-emerald-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all px-6 py-3.5 rounded-xl font-medium text-sm group"
                        >
                            <span>Access Instructor Portal</span>
                            <span className="bg-emerald-600/30 text-[10px] px-1.5 py-0.5 rounded text-emerald-100 border border-emerald-500/30">Teacher Mode</span>
                        </button>
                    </div>

                    <p className="mt-12 text-xs text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} CED KMUTNB. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
