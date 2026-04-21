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

    const analysis = useMemo(() => {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        let missingCount = 0;
        let upcomingCount = 0;
        let criticalTask: any = null;
        let closestDueDate = Infinity;

        assignments.forEach(a => {
            const sub = submissions.find(s => s.courseWorkId === a.id);
            const isTurnedIn = sub?.state === 'TURNED_IN' || sub?.state === 'RETURNED';
            
            if (isTurnedIn) return;

            if (a.dueDate) {
                const hr = a.dueTime?.hours || 23;
                const min = a.dueTime?.minutes || 59;
                const dueDateObj = new Date(Date.UTC(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day, hr, min));
                
                if (dueDateObj.getTime() < now.getTime()) {
                    missingCount++;
                    if (!criticalTask || dueDateObj.getTime() < closestDueDate) {
                        criticalTask = a;
                        closestDueDate = dueDateObj.getTime();
                    }
                } else {
                    const dueMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate()).getTime();
                    const daysUntilDue = Math.round((dueMidnight - todayMidnight) / (1000 * 3600 * 24));
                    if (daysUntilDue <= 3) {
                        upcomingCount++;
                    }
                }
            }
        });

        // Generate AI Insight text
        let title = '';
        let feedback = '';
        let type: 'critical' | 'warning' | 'good' = 'good';
        let recommendation = '';

        if (missingCount > 0) {
            type = 'critical';
            title = language === 'th' ? 'ต้องปรับกลยุทธ์เวลา' : 'Time Strategy Needed';
            feedback = language === 'th' 
                ? `คุณมีงานค้างส่งอยู่ ${missingCount} ชิ้น สาเหตุอาจเกิดจากการประเมินเวลาทำงานน้อยเกินไป หรือมีงานแทรก`
                : `You currently have ${missingCount} missing tasks. This backlog may be due to underestimating the time required.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: แบ่งเวลา 30 นาทีวันนี้เพื่อเริ่มทำ "${criticalTask?.title || 'งานที่ค้าง'}" โดยปิดการแจ้งเตือนต่างๆ เพื่อโฟกัสเต็มที่`
                : `Recommendation: Block 30 minutes today to start on "${criticalTask?.title || 'your missing work'}". Eliminate distractions to regain momentum.`;
        } else if (upcomingCount > 0) {
            type = 'warning';
            title = language === 'th' ? 'รักษาระยะให้ดี' : 'Maintain Your Pace';
            feedback = language === 'th'
                ? `การส่งงานของคุณอยู่ในเกณฑ์ปกติ แต่มีงานด่วนรออยู่ ${upcomingCount} ชิ้นในเร็วๆ นี้`
                : `Your submission rate is solid, but you have ${upcomingCount} upcoming tasks arriving soon.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: ทยอยทำงานย่อยล่วงหน้าวันละนิด จะช่วยลดความกดดันและทำให้ผลงานมีประสิทธิภาพมากกว่าการโหมทำวันสุดท้าย`
                : `Recommendation: Divide these upcoming tasks into smaller daily chunks. This reduces stress and improves final output quality.`;
        } else {
            type = 'good';
            title = language === 'th' ? 'การจัดเวลาของยอดเยี่ยม' : 'Excellent Time Management';
            feedback = language === 'th'
                ? `คุณจัดการงานได้อย่างสมบูรณ์แบบ รูปแบบการจัดสรรเวลาส่งผลให้ไม่มีงานค้างและไม่มีความเครียดสะสม`
                : `You have perfectly managed your assignments. Your strategy keeps you completely caught up with zero stress.`;
            recommendation = language === 'th'
                ? `คำแนะนำ: รักษาวินัยการทำงานแบบนี้ต่อไป หรือลองใช้เวลาที่เหลือไปอ่านเนื้อหาล่วงหน้าครับ`
                : `Recommendation: Keep up this fantastic discipline! Consider using free time to review upcoming materials.`;
        }

        return { type, title, feedback, recommendation };
    }, [assignments, submissions, language]);

    const getColors = () => {
        if (analysis.type === 'critical') return 'bg-red-50 border-red-200 text-red-900';
        if (analysis.type === 'warning') return 'bg-orange-50 border-orange-200 text-orange-900';
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    };

    const getIcon = () => {
        if (analysis.type === 'critical') return <AlertCircle className="text-red-500" size={24} />;
        if (analysis.type === 'warning') return <Clock className="text-orange-500" size={24} />;
        return <CheckCircle2 className="text-emerald-500" size={24} />;
    };

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
                <div className={`p-4 rounded-xl border ${getColors()} shadow-sm relative overflow-hidden transition-all duration-300`}>
                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none transform translate-x-2 -translate-y-2">
                        {getIcon()}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        {getIcon()}
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

                {/* Simulated Data Metrics for Visuals */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {language === 'th' ? 'ค่าสถิติของคุณ' : 'Your Stats'}
                    </h5>
                    
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                <span>{language === 'th' ? 'ความสม่ำเสมอ' : 'Consistency'}</span>
                                <span>{analysis.type === 'critical' ? '45%' : analysis.type === 'good' ? '98%' : '75%'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${analysis.type === 'critical' ? 'bg-red-400 w-[45%]' : analysis.type === 'good' ? 'bg-emerald-400 w-[98%]' : 'bg-orange-400 w-[75%]'}`}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                <span>{language === 'th' ? 'การจัดการเวลา' : 'Time Allocation'}</span>
                                <span>{analysis.type === 'critical' ? 'needs focus' : 'optimal'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
