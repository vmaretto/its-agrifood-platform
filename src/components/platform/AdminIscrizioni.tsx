'use client';

import React, { useState, useEffect } from 'react';
import { 
  getEnrolledStudents, 
  getStudentsNotEnrolled, 
  enrollUserInCourse, 
  unenrollUserFromCourse,
  enrollMultipleUsers 
} from '@/services/userCoursesService';
import { getCourses, Course } from '@/services/coursesService';

interface EnrolledStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrolled_at: string;
}

interface AvailableStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AdminIscrizioni: React.FC<{ courseId?: string }> = ({ courseId: initialCourseId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId || null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedToEnroll, setSelectedToEnroll] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Carica i corsi disponibili
  useEffect(() => {
    const loadCourses = async () => {
      const data = await getCourses();
      setCourses(data);
      // Se non c'è un corso selezionato e ci sono corsi, seleziona il primo
      if (!selectedCourseId && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    };
    loadCourses();
  }, []);

  // Carica gli studenti iscritti e disponibili quando cambia il corso
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourseId) return;
      
      setIsLoading(true);
      const [enrolled, available] = await Promise.all([
        getEnrolledStudents(selectedCourseId),
        getStudentsNotEnrolled(selectedCourseId)
      ]);
      setEnrolledStudents(enrolled);
      setAvailableStudents(available);
      setIsLoading(false);
    };
    loadStudents();
  }, [selectedCourseId]);

  // Formatta data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Iscrivi uno studente
  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedCourseId) return;
    
    setIsEnrolling(true);
    const result = await enrollUserInCourse(studentId, selectedCourseId, 'admin');
    if (result) {
      // Aggiorna le liste
      const student = availableStudents.find(s => s.id === studentId);
      if (student) {
        setEnrolledStudents(prev => [...prev, { 
          ...student, 
          enrolled_at: new Date().toISOString() 
        }]);
        setAvailableStudents(prev => prev.filter(s => s.id !== studentId));
      }
    }
    setIsEnrolling(false);
  };

  // Iscrivi multipli studenti
  const handleEnrollMultiple = async () => {
    if (!selectedCourseId || selectedToEnroll.length === 0) return;
    
    setIsEnrolling(true);
    const count = await enrollMultipleUsers(selectedToEnroll, selectedCourseId, 'admin');
    
    if (count > 0) {
      // Ricarica le liste
      const [enrolled, available] = await Promise.all([
        getEnrolledStudents(selectedCourseId),
        getStudentsNotEnrolled(selectedCourseId)
      ]);
      setEnrolledStudents(enrolled);
      setAvailableStudents(available);
      setSelectedToEnroll([]);
      setShowAddModal(false);
    }
    setIsEnrolling(false);
  };

  // Rimuovi iscrizione
  const handleUnenrollStudent = async (studentId: string) => {
    if (!selectedCourseId) return;
    if (!confirm('Sei sicuro di voler rimuovere questo studente dal corso?')) return;
    
    const success = await unenrollUserFromCourse(studentId, selectedCourseId);
    if (success) {
      // Aggiorna le liste
      const student = enrolledStudents.find(s => s.id === studentId);
      if (student) {
        setAvailableStudents(prev => [...prev, {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email
        }]);
        setEnrolledStudents(prev => prev.filter(s => s.id !== studentId));
      }
    }
  };

  // Toggle selezione studente
  const toggleStudentSelection = (studentId: string) => {
    setSelectedToEnroll(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Seleziona tutti gli studenti filtrati
  const selectAllFiltered = () => {
    const filteredIds = filteredAvailableStudents.map(s => s.id);
    setSelectedToEnroll(filteredIds);
  };

  // Deseleziona tutti
  const deselectAll = () => {
    setSelectedToEnroll([]);
  };

  // Filtra studenti disponibili
  const filteredAvailableStudents = availableStudents.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const email = (s.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Trova il corso selezionato
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Gestione Iscrizioni</h1>
          <p className="text-gray-500">Gestisci gli studenti iscritti ai corsi</p>
        </div>
      </div>

      {/* Selettore Corso */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Seleziona Corso</h3>
        <div className="flex flex-wrap gap-3">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                selectedCourseId === course.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{course.icon}</span>
              <span className="font-medium">{course.name}</span>
              {selectedCourseId === course.id && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {enrolledStudents.length} iscritti
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Studenti Iscritti */}
      {selectedCourseId && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                Studenti iscritti a {selectedCourse?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Caricamento...' : `${enrolledStudents.length} studenti iscritti`}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <span>+</span>
              <span>Aggiungi Studenti</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              Caricamento studenti...
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-500">
                Nessuno studente iscritto a questo corso.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
              >
                Aggiungi il primo studente
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600 text-sm">Studente</th>
                  <th className="text-left p-4 font-semibold text-gray-600 text-sm">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-600 text-sm">Iscritto il</th>
                  <th className="text-right p-4 font-semibold text-gray-600 text-sm">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student, idx) => (
                  <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="font-medium text-gray-800">
                          {student.first_name} {student.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {student.email || '-'}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {formatDate(student.enrolled_at)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnenrollStudent(student.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Rimuovi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Aggiungi Studenti */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-emerald-500 to-teal-600">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">Aggiungi Studenti</h2>
                    <p className="text-sm opacity-90">
                      {selectedCourse?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Ricerca e selezione */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Cerca studente per nome o email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllFiltered}
                      className="px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      Seleziona tutti
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Deseleziona
                    </button>
                  </div>
                </div>
                {selectedToEnroll.length > 0 && (
                  <div className="mt-2 text-sm text-emerald-600">
                    {selectedToEnroll.length} studenti selezionati
                  </div>
                )}
              </div>

              {/* Lista studenti disponibili */}
              <div className="overflow-y-auto max-h-[40vh]">
                {availableStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>Tutti gli studenti sono già iscritti a questo corso.</p>
                  </div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>Nessuno studente trovato con questa ricerca.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredAvailableStudents.map(student => (
                      <label
                        key={student.id}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedToEnroll.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email || 'Nessuna email'}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEnrollStudent(student.id);
                          }}
                          disabled={isEnrolling}
                          className="px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          Aggiungi
                        </button>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-between">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Chiudi
                </button>
                <button
                  onClick={handleEnrollMultiple}
                  disabled={isEnrolling || selectedToEnroll.length === 0}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isEnrolling ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Iscrizione...</span>
                    </>
                  ) : (
                    <>
                      <span>Iscrivi {selectedToEnroll.length} studenti</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminIscrizioni;
