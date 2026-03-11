import { supabase } from '@/lib/supabase';
import { Course } from './coursesService';

// ============================================
// TYPES
// ============================================

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  enrolled_by: string;
  is_active: boolean;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  course_id: string;
  course_name: string;
  course_slug: string;
  course_icon: string;
  enrolled_at: string;
  enrolled_by: string;
  is_active: boolean;
}

export interface StudentNotEnrolled {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  course_id: string;
  course_name: string;
}

// ============================================
// USER COURSES CRUD
// ============================================

// Ottieni i corsi a cui uno studente è iscritto
// Prima cerca tramite team (studente → team → corso)
// Poi cerca anche in user_courses come fallback
export async function getUserCourses(userId: string): Promise<Course[]> {
  const coursesMap = new Map<string, Course>();
  
  // 1. Cerca corsi tramite il team dello studente
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select(`
      team_id,
      teams (
        course_id,
        courses (
          id,
          name,
          slug,
          description,
          icon,
          is_active
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (!studentError && studentData?.teams) {
    const teams = studentData.teams as { course_id: string; courses: Course | Course[] | null } | { course_id: string; courses: Course | Course[] | null }[];
    const teamData = Array.isArray(teams) ? teams[0] : teams;
    if (teamData?.courses) {
      const course = Array.isArray(teamData.courses) ? teamData.courses[0] : teamData.courses;
      if (course && course.is_active) {
        coursesMap.set(course.id, course);
      }
    }
  }

  // 2. Cerca anche in user_courses come fallback
  const { data: userCoursesData, error: ucError } = await supabase
    .from('user_courses')
    .select(`
      course_id,
      courses (
        id,
        name,
        slug,
        description,
        icon,
        is_active
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!ucError && userCoursesData) {
    for (const uc of userCoursesData) {
      const course = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses;
      if (course && course.is_active && !coursesMap.has(course.id)) {
        coursesMap.set(course.id, course);
      }
    }
  }

  return Array.from(coursesMap.values());
}

// Verifica se uno studente ha accesso a un corso
export async function userHasCourseAccess(userId: string, courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_courses')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking course access:', error);
    return false;
  }

  return data !== null;
}

// Iscrivi uno studente a un corso
export async function enrollUserInCourse(
  userId: string, 
  courseId: string, 
  enrolledBy: string = 'admin'
): Promise<UserCourse | null> {
  const { data, error } = await supabase
    .from('user_courses')
    .insert([{
      user_id: userId,
      course_id: courseId,
      enrolled_by: enrolledBy
    }])
    .select()
    .single();

  if (error) {
    // Se l'errore è per conflitto (già iscritto), riattiva l'iscrizione
    if (error.code === '23505') {
      const { data: updated, error: updateError } = await supabase
        .from('user_courses')
        .update({ is_active: true, enrolled_by: enrolledBy })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error reactivating enrollment:', updateError);
        return null;
      }
      return updated;
    }
    console.error('Error enrolling user:', error);
    return null;
  }

  return data;
}

// Rimuovi uno studente da un corso (soft delete)
export async function unenrollUserFromCourse(userId: string, courseId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_courses')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    console.error('Error unenrolling user:', error);
    return false;
  }

  return true;
}

// Rimuovi definitivamente uno studente da un corso (hard delete)
export async function deleteUserEnrollment(userId: string, courseId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_courses')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    console.error('Error deleting enrollment:', error);
    return false;
  }

  return true;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

// Ottieni tutte le iscrizioni per un corso
export async function getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching course enrollments:', error);
    return [];
  }

  return data || [];
}

// Ottieni tutti gli studenti iscritti a un corso
export async function getEnrolledStudents(courseId: string): Promise<{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrolled_at: string;
}[]> {
  const { data, error } = await supabase
    .from('user_courses')
    .select(`
      enrolled_at,
      students (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('course_id', courseId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching enrolled students:', error);
    return [];
  }

  return (data || []).map((uc: { enrolled_at: string; students: { id: string; first_name: string; last_name: string; email: string } | { id: string; first_name: string; last_name: string; email: string }[] | null }) => {
    const student = Array.isArray(uc.students) ? uc.students[0] : uc.students;
    return {
      id: student?.id || '',
      first_name: student?.first_name || '',
      last_name: student?.last_name || '',
      email: student?.email || '',
      enrolled_at: uc.enrolled_at
    };
  }).filter(s => s.id);
}

// Ottieni studenti NON iscritti a un corso specifico
export async function getStudentsNotEnrolled(courseId: string): Promise<{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}[]> {
  // Prima ottieni tutti gli studenti
  const { data: allStudents, error: studentsError } = await supabase
    .from('students')
    .select('id, first_name, last_name, email')
    .order('last_name', { ascending: true });

  if (studentsError) {
    console.error('Error fetching students:', studentsError);
    return [];
  }

  // Poi ottieni gli ID degli studenti già iscritti a questo corso
  const { data: enrolledData, error: enrolledError } = await supabase
    .from('user_courses')
    .select('user_id')
    .eq('course_id', courseId)
    .eq('is_active', true);

  if (enrolledError) {
    console.error('Error fetching enrolled users:', enrolledError);
    return allStudents || [];
  }

  const enrolledIds = new Set((enrolledData || []).map(e => e.user_id));

  // Filtra gli studenti non iscritti
  return (allStudents || []).filter(s => !enrolledIds.has(s.id));
}

// Iscrivi multipli studenti a un corso
export async function enrollMultipleUsers(
  userIds: string[], 
  courseId: string, 
  enrolledBy: string = 'admin'
): Promise<number> {
  let successCount = 0;
  
  for (const userId of userIds) {
    const result = await enrollUserInCourse(userId, courseId, enrolledBy);
    if (result) {
      successCount++;
    }
  }
  
  return successCount;
}

// Rimuovi multipli studenti da un corso
export async function unenrollMultipleUsers(userIds: string[], courseId: string): Promise<number> {
  let successCount = 0;
  
  for (const userId of userIds) {
    const result = await unenrollUserFromCourse(userId, courseId);
    if (result) {
      successCount++;
    }
  }
  
  return successCount;
}

// Conta studenti iscritti a un corso
export async function getEnrollmentCount(courseId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_courses')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .eq('is_active', true);

  if (error) {
    console.error('Error counting enrollments:', error);
    return 0;
  }

  return count || 0;
}
