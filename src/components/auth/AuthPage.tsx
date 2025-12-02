'use client';

import React, { useState } from 'react';
import { signIn, signUp, UserProfile } from '@/services/authService';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { user, error: loginError } = await signIn(email, password);
        if (loginError) {
          setError(loginError);
        } else if (user) {
          onAuthSuccess(user);
        }
      } else {
        // Registrazione
        if (!firstName.trim() || !lastName.trim()) {
          setError('Inserisci nome e cognome');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La password deve avere almeno 6 caratteri');
          setIsLoading(false);
          return;
        }

        const role = isTeacher ? 'teacher' : 'student';
        const { user, error: signUpError } = await signUp(
          email,
          password,
          firstName.trim(),
          lastName.trim(),
          role
        );

        if (signUpError) {
          setError(signUpError);
        } else if (user) {
          onAuthSuccess(user);
        }
      }
    } catch (err) {
      setError('Si e verificato un errore. Riprova.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
          <div className="text-4xl mb-2">ITS</div>
          <h1 className="text-2xl font-bold">AgriFood Academy</h1>
          <p className="text-emerald-100 text-sm mt-2">ITS Eat Agrifuture</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            {isLogin ? 'Accedi' : 'Registrati'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Mario"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Cognome
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Rossi"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="email@esempio.it"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={isLogin ? '********' : 'Minimo 6 caratteri'}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isTeacher"
                  checked={isTeacher}
                  onChange={(e) => setIsTeacher(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isTeacher" className="text-sm text-gray-600">
                  Sono un docente
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Caricamento...
                </span>
              ) : isLogin ? (
                'Accedi'
              ) : (
                'Registrati'
              )}
            </button>
          </form>

          {/* Toggle Login/Registrazione */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              {isLogin
                ? 'Non hai un account? Registrati'
                : 'Hai gia un account? Accedi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
