import React, { useMemo } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, Clock, Sparkles, Target, Zap } from 'lucide-react';
import type { Assignment, Submission } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface AIInsightsProps {
    assignments: Assignment[];
    submissions: Submission[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ assignments, submissions }) => {
    const { language, t } = useLanguage();

    const stats = useMemo(() => {
        const total = assignments.length;
        if (total === 0) return { consistency: 0, onTimeRate: 100, missingCount: 0, lateCount: 0 };

        const turnedIn = submissions.filter(s => s.state === 'TURNED_IN' || s.state === 'RETURNED');
        const turnedInCount = turnedIn.length;
        const missingCount = assignments.filter(a => {
            const s = submissions.find(sub => sub.courseWorkId === a.id);
            return !s || (s.state !== 'TURNED_IN' && s.state !== 'RETURNED');
        }).length;

        const lateCount = turnedIn.filter(s => s.late).length;

        const consistency = Math.round((turnedInCount / total) * 100);
        const onTimeRate = turnedInCount > 0 ? Math.round(((turnedInCount - lateCount) / turnedInCount) * 100) : 100;

        return { consistency, onTimeRate, missingCount, lateCount };
    }, [assignments, submissions]);

    const analysis = useMemo(() => {
        const { missingCount, lateCount, consistency, onTimeRate } = stats;

        const missingAssignments = assignments.filter(a => {
            const s = submissions.find(sub => sub.courseWorkId === a.id);
            return !s || (s.state !== 'TURNED_IN' && s.state !== 'RETURNED');
        });

        let criticalTask: Assignment | null = null;
        let closestDueDate = Infinity;

        missingAssignments.forEach(a => {
            if (a.dueDate) {
                const hr = a.dueTime?.hours || 23;
                const min = a.dueTime?.minutes || 59;
                const dueDateObj = new Date(Date.UTC(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day, hr, min));
                if (dueDateObj.getTime() < closestDueDate) {
                    closestDueDate = dueDateObj.getTime();
                    criticalTask = a;
                }
            }
        });

        let title = '';
        let feedback = '';
        let type: 'critical' | 'warning' | 'good' = 'good';
        let recommendation = '';

        if (missingCount > 0) {
            type = 'critical';
            const taskTitle = (criticalTask as any)?.title || (language === 'th' ? 'งานที่ค้าง' : 'your missing work');
            title = language === 'th' ? 'ก้าวเล็กๆ สู่ความสำเร็จ' : 'Small Steps to Success';
            feedback = language === 'th' 
                ? `เห็นว่ามีงานที่ยังไม่ได้ส่ง ${missingCount} ชิ้นนะ ไม่ต้องกังวลไป! บางครั้งเราอาจจะรู้สึกว่างานยากจนไม่กล้าเริ่ม หรือแค่ยังหาจังหวะที่ใช่ไม่ได้ ลองมาเริ่มกันวันละนิดดีไหม?`
                : `You have ${missingCount} missing tasks. Don't worry! Sometimes tasks feel so hard we're afraid to start. Let's take it one small step at a time.`;
            recommendation = language === 'th'
                ? `ลองเริ่มจากสิ่งที่ง่ายที่สุดของงาน "${taskTitle}" แค่ 15 นาทีพอ ไม่ต้องสมบูรณ์แบบก็ได้ หัวใจสำคัญคือการ "ได้เริ่ม" ครับ สู้ๆ!`
                : `Try starting with the easiest part of "${taskTitle}" for just 15 minutes. It doesn't have to be perfect; the most important thing is just getting started. You can do it!`;
        } else if (lateCount > 0) {
            type = 'warning';
            title = language === 'th' ? 'ฝึกจังหวะการเรียนให้ดีขึ้น' : 'Fine-tune Your Rhythm';
            feedback = language === 'th'
                ? `งานส่งครบเก่งมากเลย! แต่มีบางชิ้นที่ส่งช้าไปนิดเดียวเอง ลองปรับจังหวะให้เร็วขึ้นอีกหน่อย เพื่อให้มีเวลาพักผ่อนและทำสิ่งที่ชอบได้มากขึ้นนะ`
                : `You've submitted everything, which is great! A few were just a bit late. Let's try to speed up the rhythm so you have more time for things you enjoy.`;
            recommendation = language === 'th'
                ? `สัปดาห์หน้าลองตั้งเป้าเริ่มทำงานให้เร็วขึ้น 1 วันดูนะ จะได้ไม่ต้องรีบช่วงท้าย ลองแล้วจะรู้ว่าเรียนแบบไม่เครียดมันสนุกกว่าเยอะเลย!`
                : `Next week, try starting just one day earlier. You'll find that learning without the deadline stress is much more fun!`;
        } else if (consistency < 80) {
            type = 'warning';
            title = language === 'th' ? 'ค่อยๆ สร้างความสม่ำเสมอ' : 'Building Consistency';
            feedback = language === 'th'
                ? `แนวโน้มการทำผลงานของคุณเริ่มมาดีแล้วนะ แต่อาจจะมีบางช่วงที่หลุดไปบ้าง ลองมาสร้างวินัยเล็กๆ เพื่อผลลัพธ์ที่น่าภูมิใจในระยะยาวกัน`
                : `Your progress is looking good, but there are a few gaps. Let's build some small habits together for long-term success.`;
            recommendation = language === 'th'
                ? `ลองกำหนดเวลาเดิมในแต่ละวัน เพื่อสร้างวินัยเล็กๆ การทำสม่ำเสมอคือกุญแจสำคัญสู่ความสำเร็จครับ`
                : `Suggestion: Set a fixed time each day just to check Classroom for 5-10 minutes. Consistency is the key!`;
        } else {
            type = 'good';
            title = language === 'th' ? 'จัดการเวลาได้ยอดเยี่ยม' : 'Excellent Time Management';
            feedback = language === 'th'
                ? `คุณกำลังอยู่บนเส้นทางแห่งความสำเร็จ! อัตราการส่งงานตรงเวลาของคุณคือ ${onTimeRate}% ซึ่งยอดเยี่ยมมากจริงๆ`
                : `You are on the path to success! Your on-time submission rate is a fantastic ${onTimeRate}%.`;
            recommendation = language === 'th'
                ? `รักษามาตรฐานที่ยอดเยี่ยมนี้ไว้นะครับ นี่คือจุดเริ่มต้นของการสร้างโอกาสดีๆ ในอนาคต ลองใช้เวลาที่เหลือไปผ่อนคลายหรือหาความรู้อื่นๆ ที่สนใจดูนะ`
                : `Keep up this excellent standard! This discipline will open many doors for you. Use your free time to relax or explore new interests.`;
        }

        return { type, title, feedback, recommendation };
    }, [assignments, submissions, language, stats]);

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden group">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-50 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-indigo-100 shadow-lg">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-base tracking-tight leading-none">
                            {t('insight.title')}
                        </h3>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1.5 opacity-80">Workspace Analytics</p>
                    </div>
                </div>
                <Sparkles size={16} className="text-indigo-300 animate-pulse" />
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                {/* Main Card */}
                <div className={`p-5 rounded-2xl border-0 shadow-sm relative overflow-hidden transition-all duration-300 ${
                    analysis.type === 'critical' ? 'bg-rose-50/80 text-rose-900 border-rose-100' : 
                    analysis.type === 'warning' ? 'bg-amber-50/80 text-amber-900 border-amber-100' : 
                    'bg-emerald-50/80 text-emerald-900 border-emerald-100'
                }`}>
                    {/* Background flourish icon */}
                    <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                        {analysis.type === 'critical' ? <Zap size={140} /> : analysis.type === 'warning' ? <Target size={140} /> : <Target size={140} />}
                    </div>

                    <div className="flex items-center gap-2.5 mb-4 relative z-10">
                        <div className={`p-1.5 rounded-lg ${
                            analysis.type === 'critical' ? 'bg-rose-100 text-rose-600' : 
                            analysis.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                            'bg-emerald-100 text-emerald-600'
                        }`}>
                            {analysis.type === 'critical' ? <AlertCircle size={20} /> : analysis.type === 'warning' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base tracking-tight uppercase opacity-90">{analysis.title}</h4>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="text-sm leading-relaxed font-semibold opacity-90">
                            {analysis.feedback}
                        </div>
                        
                        <div className="text-[13px] bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm leading-relaxed">
                            <span className="font-bold flex items-center gap-1.5 mb-1.5 text-indigo-600">
                                <Sparkles size={14} />
                                {language === 'th' ? 'แนวทางแก้ไข' : 'Actionable Step'}:
                            </span>
                            <span className="text-slate-700 font-medium">{analysis.recommendation}</span>
                        </div>
                    </div>
                </div>

                {/* Real Stats Section */}
                <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-5 bg-white relative">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            {language === 'th' ? 'ค่าสถิติจริงของคุณ' : 'Performance Metrics'}
                        </h5>
                        <div className="h-px flex-1 bg-slate-100 ml-4"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-center mb-2.5">
                                <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    {language === 'th' ? 'อัตราความสำเร็จ' : 'Consistency (Completion)'}
                                </span>
                                <span className="text-sm font-black text-slate-800">{stats.consistency}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner p-0.5">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 shadow-sm ${stats.consistency < 60 ? 'bg-rose-500' : stats.consistency < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${stats.consistency}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-center mb-2.5">
                                <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                                    {language === 'th' ? 'ความตรงต่อเวลา' : 'On-Time Rate'}
                                </span>
                                <span className="text-sm font-black text-slate-800">{stats.onTimeRate}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner p-0.5">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 shadow-sm ${stats.onTimeRate < 60 ? 'bg-rose-500' : stats.onTimeRate < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${stats.onTimeRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
