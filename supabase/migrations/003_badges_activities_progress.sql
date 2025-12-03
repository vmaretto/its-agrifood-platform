-- Migration: Badges, Activities, and Progress Enhancement
-- Run this in Supabase SQL Editor

-- ============================================
-- ADD MISSING FIELDS TO STUDENTS TABLE
-- ============================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_id UUID;
ALTER TABLE students ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';

CREATE INDEX IF NOT EXISTS idx_students_auth_id ON students(auth_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- ============================================
-- TABELLA BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL DEFAULT '🏆',
  criteria_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'points', 'modules', 'quizzes', 'team'
  criteria_value INTEGER DEFAULT 0, -- e.g., points >= 50, modules_completed >= 1
  points_reward INTEGER DEFAULT 0, -- bonus points when badge is earned
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELLA USER_BADGES (badges assegnati)
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by VARCHAR(255) DEFAULT 'system', -- 'system' o nome admin
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

-- ============================================
-- TABELLA ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES students(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL, -- 'quiz_completed', 'module_completed', 'badge_earned', 'slide_viewed', 'bonus_received'
  target_type VARCHAR(50), -- 'module', 'slide', 'quiz', 'badge', 'team'
  target_id VARCHAR(255), -- ID del target
  target_name VARCHAR(500), -- Nome leggibile
  points_earned INTEGER DEFAULT 0,
  details JSONB, -- Extra data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_team ON activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action_type);

-- ============================================
-- TABELLA MODULE PROGRESS (se non esiste)
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id VARCHAR(255) NOT NULL,
  current_slide INTEGER DEFAULT 1,
  completed_slides INTEGER[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module ON user_progress(module_id);

-- ============================================
-- TABELLA LEADERBOARD HISTORY (per trend)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  position INTEGER NOT NULL,
  recorded_at DATE DEFAULT CURRENT_DATE,
  CONSTRAINT leaderboard_target CHECK (team_id IS NOT NULL OR student_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_history_team ON leaderboard_history(team_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_student ON leaderboard_history(student_id, recorded_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_history_daily_team ON leaderboard_history(team_id, recorded_at) WHERE team_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_history_daily_student ON leaderboard_history(student_id, recorded_at) WHERE student_id IS NOT NULL;

-- ============================================
-- INSERT DEFAULT BADGES
-- ============================================
INSERT INTO badges (name, description, icon, criteria_type, criteria_value, points_reward) VALUES
  ('Primo Passo', 'Completa la prima slide di un modulo', '🎯', 'slides', 1, 5),
  ('Quiz Master', 'Rispondi correttamente a 5 quiz', '🧠', 'quizzes', 5, 20),
  ('Team Player', 'Entra a far parte di una squadra', '🤝', 'team', 1, 10),
  ('Studente Modello', 'Completa il primo modulo', '📚', 'modules', 1, 30),
  ('Esperto', 'Raggiungi 100 punti', '⭐', 'points', 100, 25),
  ('Campione', 'Raggiungi 500 punti', '🏆', 'points', 500, 50),
  ('Innovatore', 'Completa 3 moduli', '💡', 'modules', 3, 40)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNZIONE: Registra attività
-- ============================================
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_team_id UUID,
  p_action_type VARCHAR,
  p_target_type VARCHAR,
  p_target_id VARCHAR,
  p_target_name VARCHAR,
  p_points_earned INTEGER DEFAULT 0,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, team_id, action_type, target_type, target_id, target_name, points_earned, details)
  VALUES (p_user_id, p_team_id, p_action_type, p_target_type, p_target_id, p_target_name, p_points_earned, p_details)
  RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNZIONE: Calcola progresso modulo
-- ============================================
CREATE OR REPLACE FUNCTION get_module_progress(p_user_id UUID, p_module_id VARCHAR)
RETURNS TABLE (
  current_slide INTEGER,
  total_slides INTEGER,
  completed_count INTEGER,
  progress_percent NUMERIC,
  is_completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(up.current_slide, 1)::INTEGER,
    COALESCE((SELECT COUNT(*)::INTEGER FROM jsonb_array_elements((m.slides)::jsonb)), 0),
    COALESCE(array_length(up.completed_slides, 1), 0)::INTEGER,
    CASE
      WHEN (SELECT COUNT(*) FROM jsonb_array_elements((m.slides)::jsonb)) > 0
      THEN ROUND((COALESCE(array_length(up.completed_slides, 1), 0)::NUMERIC /
           (SELECT COUNT(*) FROM jsonb_array_elements((m.slides)::jsonb))::NUMERIC) * 100, 1)
      ELSE 0
    END,
    COALESCE(up.is_completed, false)
  FROM modules m
  LEFT JOIN user_progress up ON up.module_id = m.id AND up.user_id = p_user_id
  WHERE m.id = p_module_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNZIONE: Ottieni statistiche utente
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_points INTEGER,
  modules_completed INTEGER,
  quizzes_correct INTEGER,
  badges_earned INTEGER,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    get_student_points(p_user_id)::INTEGER,
    (SELECT COUNT(*)::INTEGER FROM user_progress WHERE user_id = p_user_id AND is_completed = true),
    (SELECT COUNT(*)::INTEGER FROM student_quiz_scores WHERE student_id = p_user_id AND is_correct = true),
    (SELECT COUNT(*)::INTEGER FROM user_badges WHERE user_id = p_user_id),
    0::INTEGER; -- streak da implementare
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Attività recenti globali
-- ============================================
CREATE OR REPLACE VIEW recent_activities AS
SELECT
  al.id,
  al.user_id,
  s.first_name,
  s.last_name,
  s.team_id,
  t.name as team_name,
  t.color as team_color,
  al.action_type,
  al.target_type,
  al.target_id,
  al.target_name,
  al.points_earned,
  al.details,
  al.created_at
FROM activity_logs al
LEFT JOIN students s ON al.user_id = s.id
LEFT JOIN teams t ON s.team_id = t.id
ORDER BY al.created_at DESC;

-- ============================================
-- VIEW: Badges con conteggio assegnazioni
-- ============================================
CREATE OR REPLACE VIEW badges_with_counts AS
SELECT
  b.*,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.badge_id = b.id) as times_awarded
FROM badges b
WHERE b.is_active = true
ORDER BY b.criteria_value ASC;

-- ============================================
-- VIEW: Classifica studenti aggiornata
-- ============================================
DROP VIEW IF EXISTS students_leaderboard;
CREATE OR REPLACE VIEW students_leaderboard AS
SELECT
  s.id,
  s.first_name,
  s.last_name,
  s.email,
  s.auth_id,
  s.role,
  s.team_id,
  t.name as team_name,
  t.color as team_color,
  get_student_points(s.id) as points,
  (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = s.id AND up.is_completed = true) as modules_completed,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = s.id) as badges_count
FROM students s
LEFT JOIN teams t ON s.team_id = t.id
ORDER BY points DESC;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_history ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica
CREATE POLICY "Allow public read on badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Allow public read on user_badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Allow public read on activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public read on user_progress" ON user_progress FOR SELECT USING (true);
CREATE POLICY "Allow public read on leaderboard_history" ON leaderboard_history FOR SELECT USING (true);

-- Scrittura pubblica (in produzione limitare)
CREATE POLICY "Allow public insert on badges" ON badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on badges" ON badges FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on badges" ON badges FOR DELETE USING (true);

CREATE POLICY "Allow public insert on user_badges" ON user_badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on user_badges" ON user_badges FOR DELETE USING (true);

CREATE POLICY "Allow public insert on activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on user_progress" ON user_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_progress" ON user_progress FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on leaderboard_history" ON leaderboard_history FOR INSERT WITH CHECK (true);
