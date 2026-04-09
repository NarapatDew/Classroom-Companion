export type Language = 'th' | 'en';

type TranslationMap = Record<Language, string>;

export const translations: Record<string, TranslationMap> = {
  'app.language': { th: 'ภาษาไทย', en: 'English' },
  'app.switchLanguage': { th: 'เปลี่ยนภาษา', en: 'Switch Language' },
  'brand.name': { th: 'Classroom Companion', en: 'Classroom Companion' },
  'brand.tagline': { th: 'Google Classroom ใช้ง่ายขึ้น', en: 'Google Classroom, made simpler.' },
  'brand.disclaimer': {
    th: 'Classroom Companion เป็นแอป third-party และไม่มีความเกี่ยวข้องกับ Google',
    en: 'Classroom Companion is a third-party app and is not affiliated with Google.',
  },
  'login.welcome': { th: 'ยินดีต้อนรับกลับ', en: 'Welcome Back!' },
  'login.subtitle': { th: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน', en: 'Please sign in to access your classroom.' },
  'login.googleSignIn': { th: 'เข้าสู่ระบบด้วย Google', en: 'Sign in with Google' },
  'login.instructor': { th: 'สำหรับผู้สอน', en: 'Instructors' },
  'login.openInstructor': { th: 'เปิดหน้าผู้สอน', en: 'Open Instructor Workspace' },
  'login.teacherMode': { th: 'โหมดผู้สอน', en: 'Teacher Mode' },
  'dashboard.studentWorkspace': { th: 'พื้นที่นักศึกษา', en: 'Student Workspace' },
  'dashboard.instructorWorkspace': { th: 'พื้นที่ผู้สอน', en: 'Instructor Workspace' },
  'dashboard.signOut': { th: 'ออกจากระบบ', en: 'Sign Out' },
  'dashboard.completedAssignments': { th: 'งานที่ส่งแล้ว', en: 'Completed Assignments' },
  'dashboard.activeCourses': { th: 'วิชาที่กำลังเรียน', en: 'Active Courses' },
  'dashboard.achievements': { th: 'ความสำเร็จ', en: 'Achievements' },
  'dashboard.overallProgress': { th: 'ภาพรวมความคืบหน้า', en: 'Overall Progress' },
  'dashboard.noCourses': { th: 'ไม่พบรายวิชา', en: 'No Courses Found' },
  'dashboard.connectionError': { th: 'เชื่อมต่อไม่สำเร็จ', en: 'Connection Error' },
  'dashboard.returnToLogin': { th: 'กลับไปหน้าเข้าสู่ระบบ', en: 'Return to Login' },
  'dashboard.syncing': { th: 'กำลังซิงก์กับ Google Classroom...', en: 'Syncing with Google Classroom...' },
};
