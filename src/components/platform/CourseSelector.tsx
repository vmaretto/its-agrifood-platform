'use client';

import React, { useState, useEffect } from 'react';
import { getCourses, Course } from '@/services/coursesService';
import { getUserCourses } from '@/services/userCoursesService';
import { UserProfile } from '@/services/authService';

interface CourseSelectorProps {
  onSelectCourse: (course: Course) => void;
  userName?: string;
  currentUser?: UserProfile | null;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ onSelectCourse, userName, currentUser }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      
      // Se è docente/admin, mostra tutti i corsi
      if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') {
        const allCourses = await getCourses();
        setCourses(allCourses);
      } 
      // Se è studente, mostra solo i corsi a cui è iscritto
      else if (currentUser?.id) {
        const userCourses = await getUserCourses(currentUser.id);
        setCourses(userCourses);
      }
      // Fallback: mostra tutti i corsi
      else {
        const allCourses = await getCourses();
        setCourses(allCourses);
      }
      
      setIsLoading(false);
    };
    loadCourses();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">ITS</div>
          <div className="text-xl">AgriFood Academy</div>
          <div className="mt-4 animate-pulse">Caricamento corsi...</div>
        </div>
      </div>
    );
  }

  // Se lo studente non è iscritto a nessun corso
  const isStudent = currentUser?.role === 'student' || (!currentUser?.role);
  const noEnrollments = isStudent && courses.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <span className="text-3xl font-bold text-white">ITS</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AgriFood Academy</h1>
          {userName && (
            <p className="text-emerald-100 text-lg">
              Benvenuto, {userName}! {noEnrollments ? '' : 'Seleziona il tuo corso.'}
            </p>
          )}
          {!userName && (
            <p className="text-emerald-100 text-lg">Seleziona il corso</p>
          )}
        </div>

        {/* No enrollments message */}
        {noEnrollments ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Nessun corso disponibile
            </h2>
            <p className="text-emerald-100 text-lg mb-6">
              Non sei ancora iscritto a nessun corso.
              <br />
              Contatta il tuo docente per essere aggiunto.
            </p>
            <div className="text-sm text-white/60">
              Una volta iscritto, potrai accedere ai contenuti del corso da qui.
            </div>
          </div>
        ) : (
          /* Course Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{course.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="text-emerald-600 font-medium text-sm group-hover:underline">
                    Entra nel corso →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {courses.length === 0 && !isLoading && !noEnrollments && (
          <div className="text-center text-white/80 mt-8">
            <p>Nessun corso disponibile al momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelector;
