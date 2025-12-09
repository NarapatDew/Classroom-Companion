import axios from 'axios';
import type { Course, Assignment, UserProfile, Submission } from '../types';

const CLASSROOM_BASE_URL = 'https://classroom.googleapis.com/v1';

export const fetchUserProfile = async (accessToken: string): Promise<UserProfile> => {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        params: { alt: 'json' },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        photoUrl: response.data.picture,
    };
};

export const fetchCourses = async (accessToken: string, teacherId?: string): Promise<Course[]> => {
    console.log('Fetching courses for token:', accessToken.substring(0, 10) + '...', teacherId ? `Teacher: ${teacherId}` : 'All');
    const params: any = {
        courseStates: ['ACTIVE', 'ARCHIVED']
    };
    if (teacherId) {
        params.teacherId = teacherId;
    }

    const response = await axios.get(`${CLASSROOM_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
        paramsSerializer: {
            indexes: null // Result: courseStates=ACTIVE&courseStates=ARCHIVED
        }
    });
    console.log('Raw Courses Response:', response.data);
    return response.data.courses || [];
};

export const fetchCourseWork = async (accessToken: string, courseId: string): Promise<Assignment[]> => {
    try {
        const response = await axios.get(`${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { orderBy: 'dueDate asc' },
        });

        const work = response.data.courseWork || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return work.map((item: any) => ({
            id: item.id,
            courseId: item.courseId,
            title: item.title,
            description: item.description,
            state: item.state,
            creationTime: item.creationTime,
            updateOne: item.updateTime, // Note: Google API uses updateTime
            maxPoints: item.maxPoints,
            dueDate: item.dueDate,
            dueTime: item.dueTime,
            alternateLink: item.alternateLink,
        }));
    } catch (error) {
        return [];
    }
};

export const fetchStudentSubmissions = async (accessToken: string, courseId: string): Promise<Submission[]> => {
    try {
        // Determine user's student submissions for a course
        // 'courseWorkId' = '-' means all coursework
        const response = await axios.get(`${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/-/studentSubmissions`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { userId: 'me' } // Explicitly ask for MY submissions
        });

        const subs = response.data.studentSubmissions || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return subs.map((s: any) => ({
            id: s.id,
            courseId: s.courseId,
            courseWorkId: s.courseWorkId,
            userId: s.userId,
            state: s.state,
            assignedGrade: s.assignedGrade,
            alternateLink: s.alternateLink
        }));
    } catch (error) {
        console.warn(`Failed to fetch submissions for course ${courseId}`, error);
        return [];
    }
};

// --- Teacher Specific Functions ---

export const fetchCourseStudents = async (accessToken: string, courseId: string): Promise<any[]> => {
    try {
        const response = await axios.get(`${CLASSROOM_BASE_URL}/courses/${courseId}/students`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data.students || [];
    } catch (error) {
        console.error(`Failed to fetch students for course ${courseId}`, error);
        return [];
    }
};

export const fetchTeacherSubmissions = async (accessToken: string, courseId: string): Promise<Submission[]> => {
    try {
        // Fetch all submissions for all students in the course
        const response = await axios.get(`${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/-/studentSubmissions`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const subs = response.data.studentSubmissions || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return subs.map((s: any) => ({
            id: s.id,
            courseId: s.courseId,
            courseWorkId: s.courseWorkId,
            userId: s.userId,
            state: s.state,
            assignedGrade: s.assignedGrade,
            alternateLink: s.alternateLink
        }));
    } catch (error) {
        console.warn(`Failed to fetch teacher submissions for course ${courseId}`, error);
        return [];
    }
};

export const fetchAllAssignments = async (accessToken: string, courses: Course[]): Promise<Assignment[]> => {
    const promises = courses.map(course => fetchCourseWork(accessToken, course.id));
    const results = await Promise.all(promises);
    return results.flat();
};

export const fetchAllSubmissions = async (accessToken: string, courses: Course[]): Promise<Submission[]> => {
    const promises = courses.map(course => fetchStudentSubmissions(accessToken, course.id));
    const results = await Promise.all(promises);
    return results.flat();
};
