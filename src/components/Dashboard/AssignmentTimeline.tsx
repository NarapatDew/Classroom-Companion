import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import type { Assignment, Submission } from '../../types';

interface AssignmentTimelineProps {
    assignments: Assignment[];
    submissions: Submission[];
}

const AssignmentTimeline: React.FC<AssignmentTimelineProps> = ({ assignments, submissions }) => {
    // Filter out assignments that have been turned in or returned
    const pendingAssignments = assignments.filter(assignment => {
        const submission = submissions.find(s => s.courseWorkId === assignment.id);
        return !submission || (submission.state !== 'TURNED_IN' && submission.state !== 'RETURNED');
    });

    const now = new Date();

    // Group into Upcoming and Missing
    const missing: Assignment[] = [];
    const upcoming: Assignment[] = [];

    pendingAssignments.forEach(assignment => {
        if (!assignment.dueDate) {
            upcoming.push(assignment); // No due date = Upcoming (or separate category, but Upcoming fits best)
            return;
        }

        const due = new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day);
        // Set due time to end of day if not specified, to avoid false "missing" on the same day
        due.setHours(23, 59, 59);

        if (due < now) {
            missing.push(assignment);
        } else {
            upcoming.push(assignment);
        }
    });

    // Sort Missing: Most recent due date first (descending) so student sees what they just missed
    missing.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day).getTime() : 0;
        return dateB - dateA;
    });

    // Sort Upcoming: Sooner due date first (ascending)
    upcoming.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day).getTime() : Infinity;
        return dateA - dateB;
    });

    return (
        <div className="bg-white border border-border rounded-lg shadow-card h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-white rounded-t-lg">
                <h3 className="text-base font-medium text-text flex items-center gap-2">
                    Work Feed
                </h3>
                <a href="https://classroom.google.com/a/not-turned-in/all" target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium cursor-pointer hover:underline">
                    View all
                </a>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-4">

                {/* Missing Section */}
                {missing.length > 0 && (
                    <div>
                        <h4 className="px-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing / Late
                        </h4>
                        {missing.map((assignment) => (
                            <a
                                key={assignment.id}
                                href={assignment.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 my-1 rounded bg-red-50 border border-red-100 hover:bg-red-100/50 flex items-start gap-3 transition-colors cursor-pointer group block"
                            >
                                <div className="bg-white p-2 rounded text-red-500 border border-red-100">
                                    <AlertCircle className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm text-text truncate group-hover:text-red-600 transition-colors">
                                            {assignment.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-red-400 font-medium truncate mt-0.5">
                                        {assignment.dueDate ? `Due ${assignment.dueDate.day}/${assignment.dueDate.month}` : 'No due date'}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* Upcoming Section */}
                <div>
                    <h4 className="px-2 text-xs font-bold text-muted uppercase tracking-wider mb-2">Upcoming</h4>
                    {upcoming.length === 0 ? (
                        <div className="p-4 text-center text-muted text-sm italic">You're all caught up!</div>
                    ) : (
                        upcoming.map((assignment) => (
                            <a
                                key={assignment.id}
                                href={assignment.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 my-1 rounded hover:bg-gray-50 flex items-start gap-3 transition-colors cursor-pointer group block"
                            >
                                <div className="bg-gray-100 p-2 rounded text-muted group-hover:bg-white group-hover:border group-hover:border-border transition-all">
                                    <Calendar className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm text-text truncate group-hover:text-primary transition-colors">
                                            {assignment.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-muted truncate mt-0.5">
                                        {assignment.dueDate ? `Due ${assignment.dueDate.day}/${assignment.dueDate.month}` : 'No due date'}
                                    </p>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentTimeline;
