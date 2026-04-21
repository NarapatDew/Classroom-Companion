export interface UserProfile {
    id: string;
    name: string;
    email: string;
    photoUrl: string;
}

export interface Course {
    id: string;
    name: string;
    section?: string;
    descriptionHeading?: string;
    room?: string;
    ownerId: string;
    creationTime: string;
    updateTime: string;
    alternateLink: string; // URL to Google Classroom
    courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    materials?: any[]; // Simplified for now
    state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
    creationTime: string;
    updateOne: string;
    dueDate?: {
        year: number;
        month: number;
        day: number;
    };
    dueTime?: {
        hours: number;
        minutes: number;
    };
    maxPoints?: number;
    alternateLink: string;
}

export interface Submission {
    id: string;
    courseId: string;
    courseWorkId: string;
    userId: string;
    state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
    assignedGrade?: number;
    late?: boolean;
    updateTime?: string;
    alternateLink: string;
}

export interface CourseData {
    course: Course;
    assignments: Assignment[];
    submissions: Submission[];
}
