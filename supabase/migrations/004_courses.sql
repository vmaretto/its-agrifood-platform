-- ============================================
-- Migration 004: Multi-Course Support
-- ============================================

-- Tabella corsi
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📚',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public write access on courses" ON courses FOR ALL USING (true);

-- Aggiungi course_id alle tabelle esistenti (nullable per retrocompatibilità)
ALTER TABLE modules ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_teams_course_id ON teams(course_id);

-- Inserisci i corsi iniziali
INSERT INTO courses (name, slug, description, icon, is_active) VALUES
  ('WineManager', 'winemanager', 'Corso WineManager - Gestione e innovazione nel settore vitivinicolo', '🍷', true),
  ('AgriFuture I Anno', 'agrifuture-1', 'Corso AgriFuture - Primo Anno - Innovazione nel settore agroalimentare', '🌱', true)
ON CONFLICT (slug) DO NOTHING;

-- Associa i moduli e team esistenti al corso WineManager
UPDATE modules SET course_id = (SELECT id FROM courses WHERE slug = 'winemanager') WHERE course_id IS NULL;
UPDATE teams SET course_id = (SELECT id FROM courses WHERE slug = 'winemanager') WHERE course_id IS NULL;

-- Aggiorna le view per includere course_id

-- Drop e ricrea teams_leaderboard con course_id
DROP VIEW IF EXISTS teams_leaderboard;
CREATE OR REPLACE VIEW teams_leaderboard AS
SELECT
  t.id,
  t.name,
  t.color,
  t.course_id,
  COALESCE(get_team_points(t.id), 0) as points,
  COUNT(DISTINCT s.id) as member_count
FROM teams t
LEFT JOIN students s ON s.team_id = t.id
GROUP BY t.id, t.name, t.color, t.course_id
ORDER BY points DESC;

-- Drop e ricrea students_leaderboard con course_id (dal team)
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
  t.course_id,
  COALESCE(get_student_points(s.id), 0) as points,
  (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = s.id AND up.is_completed = true) as modules_completed,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = s.id) as badges_count
FROM students s
LEFT JOIN teams t ON s.team_id = t.id
ORDER BY points DESC;
