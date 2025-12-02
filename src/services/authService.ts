import { supabase } from '@/lib/supabase';
import { Student } from './teamsService';

// ============================================
// TYPES
// ============================================

export interface AuthUser {
  id: string;
  email: string;
}

export interface UserProfile extends Student {
  email: string;
  auth_id: string;
  role: 'student' | 'teacher' | 'admin';
}

// ============================================
// AUTHENTICATION
// ============================================

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'student' | 'teacher' = 'student'
): Promise<{ user: UserProfile | null; error: string | null }> {
  try {
    // 1. Crea utente in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Errore durante la registrazione' };
    }

    // 2. Crea profilo nella tabella students
    const { data: profileData, error: profileError } = await supabase
      .from('students')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        email: email,
        auth_id: authData.user.id,
        role: role,
        team_id: null
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Se fallisce la creazione del profilo, proviamo a eliminare l'utente auth
      // (in produzione si dovrebbe gestire meglio)
      return { user: null, error: 'Errore durante la creazione del profilo' };
    }

    return {
      user: { ...profileData, points: 0 } as UserProfile,
      error: null
    };
  } catch (err) {
    console.error('SignUp error:', err);
    return { user: null, error: 'Errore di connessione' };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  try {
    // 1. Login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        return { user: null, error: 'Email o password non corretti' };
      }
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Errore durante il login' };
    }

    // 2. Recupera profilo dalla tabella students
    const profile = await getProfileByAuthId(authData.user.id);

    if (!profile) {
      return { user: null, error: 'Profilo non trovato' };
    }

    return { user: profile, error: null };
  } catch (err) {
    console.error('SignIn error:', err);
    return { user: null, error: 'Errore di connessione' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    console.error('SignOut error:', err);
    return { error: 'Errore durante il logout' };
  }
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

export async function getProfileByAuthId(authId: string): Promise<UserProfile | null> {
  try {
    // Prima prova con la view per avere i punti
    const { data, error } = await supabase
      .from('students_leaderboard')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error || !data) {
      // Fallback alla tabella base
      const { data: baseData, error: baseError } = await supabase
        .from('students')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (baseError || !baseData) {
        return null;
      }

      return { ...baseData, points: 0 } as UserProfile;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Error getting profile:', err);
    return null;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return await getProfileByAuthId(user.id);
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
}

// ============================================
// AUTH STATE LISTENER
// ============================================

export function onAuthStateChange(
  callback: (user: UserProfile | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfileByAuthId(session.user.id);
        callback(profile);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

// ============================================
// UTILITY
// ============================================

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('students')
    .select('id')
    .eq('email', email)
    .single();

  return !!data;
}
