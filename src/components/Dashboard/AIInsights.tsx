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
            title = language === 'th' ? 'ต้องปรับกลยุทธ์เวลา' : 'Time Strategy Needed';
            feedback = language === 'th' 
                ? `คุณมีงานค้างส่งอยู่ ${missingCount} ชิ้น สาเหตุอาจเกิดจากการประเมินเวลาทำงานน้อยเกินไป หรือมีงานแทรก`
                : `You have ${missingCount} missing tasks. This may be due to underestimating the time needed or unexpected interruptions.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: แบ่งเวลา 30 นาทีวันนี้เพื่อเริ่มทำ "${taskTitle}" โดยปิดการแจ้งเตือนต่างๆ เพื่อโฟกัสเต็มที่`
                : `Suggestion: Dedicate 30 minutes today to start on "${taskTitle}". Turn off notifications to focus deeply.`;
        } else if (lateCount > 0) {
            type = 'warning';
            title = language === 'th' ? 'เกือบจะทันกำหนด' : 'Close to Deadlines';
            feedback = language === 'th'
                ? `คุณส่งงานครบทุกชิ้น แต่มีการส่งสาย ${lateCount} ครั้งในช่วงที่ผ่านมา`
                : `You have submitted everything, but were late for ${lateCount} tasks recently.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: ลองเริ่มทำงานล่วงหน้า 2 วันสำหรับงานสัปดาห์หน้า เพื่อสร้างพื้นที่ปลอดภัยให้กับตารางเวลาของคุณ`
                : `Suggestion: Try starting work 2 days earlier next week to create a safety buffer in your schedule.`;
        } else if (consistency < 80) {
            type = 'warning';
            title = language === 'th' ? 'รักษาระยะให้ดี' : 'Pace Yourself';
            feedback = language === 'th'
                ? `แนวโน้มการส่งงานของคุณอยู่ในระดับปานกลาง (${consistency}%) ควรเพิ่มความสม่ำเสมอเพื่อเกรดที่ดีขึ้น`
                : `Your submission rate is moderate (${consistency}%). Aim for higher consistency to ensure better grades.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: กำหนดเวลาทำการบ้านในปฏิทินให้เป็นเวลาเดิมทุกวันเพื่อสร้างนิสัย`
                : `Suggestion: Schedule fixed homework slots in your calendar daily to build a routine.`;
        } else {
            type = 'good';
            title = language === 'th' ? 'การจัดเวลาของยอดเยี่ยม' : 'Excellent Time Management';
            feedback = language === 'th'
                ? `คุณจัดการงานได้อย่างสมบูรณ์แบบ อัตราการส่งงานตรงเวลาของคุณคือ ${onTimeRate}%`
                : `You managed your tasks perfectly. Your on-time submission rate is ${onTimeRate}%.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: รักษาวินัยการทำงานแบบนี้ต่อไป และลองหาเวลาว่างไปศึกษาเนื้อหาล่วงหน้าเพื่อความได้เปรียบครับ`
                : `Suggestion: Maintain this discipline and use your extra time to pre-read upcoming materials for an advantage.`;
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
