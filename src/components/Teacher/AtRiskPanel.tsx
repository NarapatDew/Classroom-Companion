import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    AlertCircle,
    CheckCircle2,
    Clock,
    Target,
    Zap
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Student {
    id: string;
    name: string;
    avatarUrl: string;
    missingAssignmentsCount: number;
    completedAssignmentsCount?: number;
}

interface Assignment {
    id: string;
    title: string;
    dueDate?: string;
}

interface Submission {
    studentId: string;
    assignmentId: string;
    status: 'TURNED_IN' | 'MISSING' | 'LATE' | 'ASSIGNED';
}

interface AtRiskPanelProps {
    students: Student[];
    assignments: Assignment[];
    submissions: Submission[];
}

const StudentAvatar: React.FC<{ url: string; name: string; className?: string }> = ({ url, name, className }) => {
    const [hasError, setHasError] = React.useState(false);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=random&color=fff&size=128`;

    return (
        <img
            src={hasError || !url ? fallbackUrl : url}
            alt={name}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

const AtRiskPanel: React.FC<AtRiskPanelProps> = ({ students, assignments, submissions }) => {
    const { language } = useLanguage();
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    // Filter students who have 2 or more missing assignments
    const atRiskStudents = students.filter(s => s.missingAssignmentsCount >= 2)
        .sort((a, b) => b.missingAssignmentsCount - a.missingAssignmentsCount);

    if (atRiskStudents.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 text-emerald-500/5 group-hover:scale-110 transition-transform duration-1000">
                    <CheckCircle2 size={240} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-500 mb-6 shadow-emerald-100 shadow-xl border border-emerald-100">
                        <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter">
                        {language === 'th' ? 'ขบวนการเรียนดีเยี่ยม!' : 'Excellent Progress!'}
                    </h3>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed uppercase text-[11px] tracking-widest">
                        {language === 'th' 
                            ? 'ไม่มีนักเรียนที่ค้างงานเกินกำหนดในขณะนี้ ทุกคนกำลังทำผลงานได้ดี' 
                            : 'Synchronized success: No students are currently at risk.'}
                    </p>
                </div>
            </div>
        );
    }

    const toggleStudent = (id: string) => {
        setExpandedStudentId(expandedStudentId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shadow-lg shadow-rose-100/50">
                            <AlertTriangle size={20} />
                        </div>
                        {language === 'th' ? 'ระบบติดตามนักเรียนที่ต้องดูแล' : 'Priority Intervention'}
                        <span className="ml-2 px-3 py-1 text-xs font-black bg-rose-600 text-white rounded-full shadow-lg shadow-rose-200">
                            {atRiskStudents.length}
                        </span>
                    </h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 ml-12">
                        {language === 'th' 
                            ? 'นักเรียนที่มีงานค้างตั้งแต่ 2 ชิ้นขึ้นไป (คลิกเพื่อดูรายละเอียด)' 
                            : 'Students with 2+ missing tasks • Click to inspect'}
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {atRiskStudents.map((student) => {
                    const isExpanded = expandedStudentId === student.id;
                    
                    const missingWorkIds = submissions
                        .filter(sub => sub.studentId === student.id && sub.status === 'MISSING')
                        .map(sub => sub.assignmentId);
                    
                    const missingAssignments = assignments.filter(a => missingWorkIds.includes(a.id));

                    return (
                        <div 
                            key={student.id}
                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${
                                isExpanded ? 'border-rose-300 shadow-2xl shadow-rose-500/5 ring-1 ring-rose-100' : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 hover:border-rose-100'
                            }`}
                        >
                            <button
                                onClick={() => toggleStudent(student.id)}
                                className="w-full flex items-center justify-between p-6 text-left group/btn relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                    <Zap size={80} />
                                </div>

                                <div className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                                    <div className="relative shrink-0">
                                        <StudentAvatar 
                                            url={student.avatarUrl} 
                                            name={student.name} 
                                            className="w-14 h-14 rounded-2xl border-2 border-white shadow-md object-cover transition-transform group-hover:scale-105" 
                                        />
                                        <div className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white w-6 h-6 rounded-xl flex items-center justify-center text-[11px] font-black border-2 border-white shadow-lg">
                                            {student.missingAssignmentsCount}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-extrabold text-slate-800 text-base tracking-tight group-hover:text-rose-600 transition-colors">
                                            {student.name}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
                                                <AlertCircle size={12} />
                                                {student.missingAssignmentsCount} {language === 'th' ? 'งานค้าง' : 'Missing'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {student.completedAssignmentsCount || 0} {language === 'th' ? 'ส่งแล้ว' : 'Completed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 group-hover/btn:bg-rose-50 group-hover/btn:text-rose-600 shadow-inner'}`}>
                                    {isExpanded ? <ChevronUp size={20} className="stroke-[3]" /> : <ChevronDown size={20} className="stroke-[3]" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-6 pb-6 pt-0">
                                            <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-6" />
                                            
                                            <div className="bg-rose-50/30 rounded-2xl p-5 border border-rose-100/50 relative overflow-hidden group/list">
                                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/list:scale-110 transition-transform">
                                                    <Target size={120} />
                                                </div>

                                                <h5 className="text-[10px] font-black text-rose-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                                    <FileText size={14} />
                                                    {language === 'th' ? 'รายการงานที่ค้างส่ง' : 'Critical Missing Data'}
                                                </h5>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                                                    {missingAssignments.length > 0 ? (
                                                        missingAssignments.map((a) => (
                                                            <div key={a.id} className="flex items-start gap-3 text-sm text-slate-700 bg-white p-4 rounded-xl border border-rose-200/40 shadow-sm hover:border-rose-300/60 transition-colors">
                                                                <div className="mt-0.5 p-1.5 bg-rose-50 text-rose-500 rounded-lg shrink-0">
                                                                    <Clock size={14} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-extrabold text-slate-800 text-sm truncate">{a.title}</div>
                                                                    {a.dueDate && (
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                                            <CalendarIcon />
                                                                            {language === 'th' ? 'กำหนดส่ง:' : 'Due:'} {a.dueDate}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-2 text-center py-6">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                                                {language === 'th' ? 'ไม่พบข้อมูลงานรายบุคคล' : 'No diagnostic data available.'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Internal icon component for cleaner code
const CalendarIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default AtRiskPanel;
