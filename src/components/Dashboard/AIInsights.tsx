import React, { useMemo } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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

        const activeAssignmentIds = new Set(assignments.map(a => a.id));
        const turnedIn = submissions.filter(s => 
            activeAssignmentIds.has(s.courseWorkId) && 
            (s.state === 'TURNED_IN' || s.state === 'RETURNED')
        );
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

        // Find the most urgent missing task if any
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
                ? `คำแนะนำ: ลองกำหนดเวลาเดิมในแต่ละวันเพื่อดู Classroom สัก 5-10 นาที การทำสม่ำเสมอคือกุญแจสำคัญสู่ความสำเร็จครับ`
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
        <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shadow-inner">
                        <BarChart3 size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 tracking-tight whitespace-nowrap">
                        {t('insight.title')}
                    </h3>
                </div>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                <div className={`p-4 rounded-xl border ${analysis.type === 'critical' ? 'bg-red-50 border-red-200 text-red-900' : analysis.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'} shadow-sm relative overflow-hidden transition-all duration-300`}>
                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none transform translate-x-2 -translate-y-2">
                        {analysis.type === 'critical' ? <AlertCircle size={24} /> : analysis.type === 'warning' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        {analysis.type === 'critical' ? <AlertCircle className="text-red-500" size={24} /> : analysis.type === 'warning' ? <Clock className="text-orange-500" size={24} /> : <CheckCircle2 className="text-emerald-500" size={24} />}
                        <h4 className="font-bold text-sm sm:text-base">{analysis.title}</h4>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="text-sm leading-relaxed opacity-90 font-medium">
                            {analysis.feedback}
                        </div>
                        
                        <div className="text-sm bg-white/60 p-3 rounded-lg border border-black/5 shadow-inner leading-relaxed">
                            <span className="font-bold block mb-1">💡 {language === 'th' ? 'แนวทางแก้ไข' : 'Actionable Step'}:</span>
                            {analysis.recommendation}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {language === 'th' ? 'ค่าสถิติจริงของคุณ' : 'Your Actual Stats'}
                    </h5>
                    
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                <span>{language === 'th' ? 'อัตราความสำเร็จ (%)' : 'Consistency (Completion %)'}</span>
                                <span>{stats.consistency}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${stats.consistency < 60 ? 'bg-red-400' : stats.consistency < 90 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                                    style={{ width: `${stats.consistency}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                <span>{language === 'th' ? 'ความตรงต่อเวลา (%)' : 'On-Time Rate (%)'}</span>
                                <span>{stats.onTimeRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${stats.onTimeRate < 60 ? 'bg-red-400' : stats.onTimeRate < 90 ? 'bg-orange-400' : 'bg-emerald-400'}`}
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
