import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    AlertCircle,
    CheckCircle2,
    Clock
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
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {language === 'th' ? 'ขบวนการเรียนดีเยี่ยม!' : 'Excellent Progress!'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    {language === 'th' 
                        ? 'ไม่มีนักเรียนที่ค้างงานเกินกำหนดในขณะนี้ ทุกคนกำลังทำผลงานได้ดี' 
                        : 'No students are currently at risk. Everyone is keeping up with their assignments.'}
                </p>
            </div>
        );
    }

    const toggleStudent = (id: string) => {
        setExpandedStudentId(expandedStudentId === id ? null : id);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={24} />
                        {language === 'th' ? 'ระบบติดตามนักเรียนที่ต้องดูแล' : 'At-Risk Student Monitor'}
                        <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                            {atRiskStudents.length}
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {language === 'th' 
                            ? 'นักเรียนที่มีงานค้างตั้งแต่ 2 ชิ้นขึ้นไป (คลิกเพื่อดูรายละเอียด)' 
                            : 'Students with 2 or more missing assignments (Click to expand)'}
                    </p>
                </div>
            </div>

            <div className="grid gap-3">
                {atRiskStudents.map((student) => {
                    const isExpanded = expandedStudentId === student.id;
                    
                    // Find missing assignments for this specific student
                    const missingWorkIds = submissions
                        .filter(sub => sub.studentId === student.id && sub.status === 'MISSING')
                        .map(sub => sub.assignmentId);
                    
                    const missingAssignments = assignments.filter(a => missingWorkIds.includes(a.id));

                    return (
                        <div 
                            key={student.id}
                            className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                                isExpanded ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'
                            }`}
                        >
                            <button
                                onClick={() => toggleStudent(student.id)}
                                className="w-full flex items-center justify-between p-4 text-left group"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="relative">
                                        <StudentAvatar 
                                            url={student.avatarUrl} 
                                            name={student.name} 
                                            className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm object-cover" 
                                        />
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                            {student.missingAssignmentsCount}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                                            {student.name}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                                <AlertCircle size={12} />
                                                {student.missingAssignmentsCount} {language === 'th' ? 'งานค้าง' : 'Missing Tasks'}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="text-xs text-gray-500 font-medium">
                                                {student.completedAssignmentsCount || 0} {language === 'th' ? 'ส่งแล้ว' : 'Completed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                                        <div className="px-4 pb-5 pt-0">
                                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
                                            
                                            <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/50">
                                                <h5 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <FileText size={14} />
                                                    {language === 'th' ? 'รายการงานที่ค้างส่ง' : 'MISSING ASSIGNMENTS'}
                                                </h5>
                                                
                                                <div className="space-y-2">
                                                    {missingAssignments.length > 0 ? (
                                                        missingAssignments.map((a) => (
                                                            <div key={a.id} className="flex items-start gap-2 text-sm text-gray-700 bg-white p-2.5 rounded-md border border-red-200/50 shadow-sm">
                                                                <Clock size={14} className="text-red-400 mt-0.5 shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold truncate">{a.title}</div>
                                                                    {a.dueDate && (
                                                                        <div className="text-[11px] text-gray-500 mt-0.5">
                                                                            {language === 'th' ? 'กำหนดส่ง:' : 'Due:'} {a.dueDate}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-gray-500 italic py-2 px-1">
                                                            {language === 'th' ? 'ไม่พบข้อมูลงานรายบุคคล' : 'No individual assignment data found.'}
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

export default AtRiskPanel;
