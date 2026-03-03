'use client';

import React, { useState, useEffect } from 'react';
import { getCourses, Course } from '@/services/coursesService';

interface CourseSelectorProps {
  onSelectCourse: (course: Course) => void;
  userName?: string;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ onSelectCourse, userName }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      const data = await getCourses();
      setCourses(data);
      setIsLoading(false);
    };
    loadCourses();
  }, []);

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
              Benvenuto, {userName}! Seleziona il tuo corso.
            </p>
          )}
          {!userName && (
            <p className="text-emerald-100 text-lg">Seleziona il corso</p>
          )}
        </div>

        {/* Course Cards */}
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

        {courses.length === 0 && !isLoading && (
          <div className="text-center text-white/80 mt-8">
            <p>Nessun corso disponibile al momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelector;
