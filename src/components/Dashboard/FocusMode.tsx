import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Target, ListTodo, ExternalLink } from 'lucide-react';
import type { Assignment } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface FocusModeProps {
    assignment: Assignment | null;
    onClose: () => void;
}

interface SubTask {
    id: string;
    text: string;
    completed: boolean;
}

const FocusMode: React.FC<FocusModeProps> = ({ assignment, onClose }) => {
    const { language } = useLanguage();
    
    // Timer State
    const WORK_TIME = 25 * 60;
    const BREAK_TIME = 5 * 60;
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<'WORK' | 'BREAK'>('WORK');

    // Subtasks State (Hardcoded pseudo-breakdown for demo)
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);

    useEffect(() => {
        if (assignment) {
            // Generate a generic breakdown based on the assignment name
            setSubTasks([
                { id: '1', text: language === 'th' ? 'อ่านทำความเข้าใจโจทย์ / คำสั่ง' : 'Read and understand the instructions', completed: false },
                { id: '2', text: language === 'th' ? `เริ่มต้นทำ "${assignment.title}"` : `Start working on "${assignment.title}"`, completed: false },
                { id: '3', text: language === 'th' ? 'ตรวจสอบความถูกต้องก่อนส่ง' : 'Review for accuracy before submitting', completed: false }
            ]);
        }
        // Reset timer
        setTimeLeft(WORK_TIME);
        setIsRunning(false);
        setMode('WORK');
    }, [assignment, language]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Auto switch mode
            if (mode === 'WORK') {
                setMode('BREAK');
                setTimeLeft(BREAK_TIME);
            } else {
                setMode('WORK');
                setTimeLeft(WORK_TIME);
                setIsRunning(false); // require manual start for next work session
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode]);

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'WORK' ? WORK_TIME : BREAK_TIME);
    };

    const toggleSubtask = (id: string) => {
        setSubTasks(prev => prev.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!assignment) return null;

    const allCompleted = subTasks.length > 0 && subTasks.every(t => t.completed);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Dark Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-20"
                >
                    <X size={24} />
                </button>

                {/* Left Side: Pomodoro Timer */}
                <div className={`md:w-5/12 p-8 sm:p-10 flex flex-col items-center justify-center text-white transition-colors duration-700 relative overflow-hidden ${mode === 'WORK' ? 'bg-indigo-600' : 'bg-teal-500'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 blur-3xl rounded-full bg-white w-64 h-64"></div>
                    <div className="relative z-10 flex flex-col items-center w-full">
                        
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium text-sm mb-8">
                            <Target size={16} />
                            {mode === 'WORK' ? (language === 'th' ? 'โหมดโฟกัส' : 'Focus Mode') : (language === 'th' ? 'หมดเวลาพัก' : 'Break Time')}
                        </div>

                        {/* Interactive Clock */}
                        <div className="relative mb-10 group">
                            <svg className="w-64 h-64 transform -rotate-90">
                                <circle
                                    className="text-white/20"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="120"
                                    cx="128"
                                    cy="128"
                                />
                                <circle
                                    className="text-white transition-all duration-1000 ease-linear"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="120"
                                    cx="128"
                                    cy="128"
                                    strokeDasharray={2 * Math.PI * 120}
                                    strokeDashoffset={(2 * Math.PI * 120) * (1 - timeLeft / (mode === 'WORK' ? WORK_TIME : BREAK_TIME))}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black tracking-tighter drop-shadow-md">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={toggleTimer}
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                {isRunning ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
                            </button>
                            <button 
                                onClick={resetTimer}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Right Side: Task Details & Breakdown */}
                <div className="md:w-7/12 p-8 sm:p-10 flex flex-col bg-gray-50/50">
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ListTodo size={18} />
                            {language === 'th' ? 'ภารกิจย่อย (Task Breakdown)' : 'Task Breakdown'}
                        </h2>
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                            {assignment.title}
                        </h3>
                        {assignment.description && (
                            <p className="text-gray-500 text-sm line-clamp-3">
                                {assignment.description}
                            </p>
                        )}
                        <a 
                            href={assignment.alternateLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mt-3"
                        >
                            {language === 'th' ? 'เปิดงานใน Google Classroom' : 'Open in Google Classroom'}
                            <ExternalLink size={14} />
                        </a>
                    </div>

                    {/* Breakdown Checklist */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-3">
                            {subTasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => toggleSubtask(task.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
                                        task.completed 
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 opacity-75' 
                                            : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm text-gray-700'
                                    }`}
                                >
                                    <div className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-gray-300'}`}>
                                        <CheckCircle size={28} className={task.completed ? 'fill-emerald-100' : ''} />
                                    </div>
                                    <span className={`text-base font-medium flex-1 ${task.completed ? 'line-through decoration-emerald-300' : ''}`}>
                                        {task.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Completion Status */}
                    {allCompleted && (
                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-200 border border-yellow-300 text-center animate-in slide-in-from-bottom-4">
                            <h4 className="text-lg font-bold text-yellow-900 mb-1">
                                🎉 {language === 'th' ? 'ภารกิจย่อยเสร็จสิ้น!' : 'Checklist Completed!'}
                            </h4>
                            <p className="text-sm text-yellow-800">
                                {language === 'th' 
                                    ? 'อย่าลืมกดปุ่ม "ส่งงาน" ใน Google Classroom เพื่อจบภารกิจอย่างเป็นทางการนะ' 
                                    : 'Make sure to explicitly click "Turn in" in Google Classroom to finalize the work.'}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default FocusMode;
