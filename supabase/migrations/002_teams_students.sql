-- Migration: Teams and Students Management
-- Run this in Supabase SQL Editor

-- ============================================
-- TABELLA SQUADRE (TEAMS)
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT 'bg-emerald-500',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELLA STUDENTI
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELLA PUNTEGGI QUIZ STUDENTI
-- ============================================
CREATE TABLE IF NOT EXISTS student_quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id VARCHAR(255) NOT NULL,
  slide_id INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0, -- punti ottenuti (es. 10 per risposta corretta)
  is_correct BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id, slide_id)
);

-- ============================================
-- TABELLA BONUS POINTS (docente può assegnare)
-- ============================================
CREATE TABLE IF NOT EXISTS bonus_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason VARCHAR(500),
  assigned_by VARCHAR(255) DEFAULT 'docente',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Almeno uno tra student_id e team_id deve essere valorizzato
  CONSTRAINT bonus_target CHECK (student_id IS NOT NULL OR team_id IS NOT NULL)
);

-- ============================================
-- INDICI PER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_team ON students(team_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_student ON student_quiz_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_module ON student_quiz_scores(module_id);
CREATE INDEX IF NOT EXISTS idx_bonus_student ON bonus_points(student_id);
CREATE INDEX IF NOT EXISTS idx_bonus_team ON bonus_points(team_id);

-- ============================================
-- FUNZIONE PER CALCOLARE PUNTI STUDENTE
-- ============================================
CREATE OR REPLACE FUNCTION get_student_points(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  quiz_points INTEGER;
  bonus_student_points INTEGER;
BEGIN
  -- Punti dai quiz
  SELECT COALESCE(SUM(score), 0) INTO quiz_points
  FROM student_quiz_scores
  WHERE student_id = p_student_id;

  -- Bonus personali
  SELECT COALESCE(SUM(points), 0) INTO bonus_student_points
  FROM bonus_points
  WHERE student_id = p_student_id;

  RETURN quiz_points + bonus_student_points;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNZIONE PER CALCOLARE PUNTI SQUADRA
-- ============================================
CREATE OR REPLACE FUNCTION get_team_points(p_team_id UUID)
RETURNS INTEGER AS $$
DECLARE
  students_points INTEGER;
  team_bonus INTEGER;
BEGIN
  -- Somma dei punti di tutti gli studenti della squadra
  SELECT COALESCE(SUM(get_student_points(s.id)), 0) INTO students_points
  FROM students s
  WHERE s.team_id = p_team_id;

  -- Bonus assegnati direttamente alla squadra
  SELECT COALESCE(SUM(points), 0) INTO team_bonus
  FROM bonus_points
  WHERE team_id = p_team_id AND student_id IS NULL;

  RETURN students_points + team_bonus;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW PER CLASSIFICA SQUADRE
-- ============================================
CREATE OR REPLACE VIEW teams_leaderboard AS
SELECT
  t.id,
  t.name,
  t.color,
  get_team_points(t.id) as points,
  (SELECT COUNT(*) FROM students s WHERE s.team_id = t.id) as member_count,
  t.created_at
FROM teams t
ORDER BY points DESC;

-- ============================================
-- VIEW PER CLASSIFICA STUDENTI
-- ============================================
CREATE OR REPLACE VIEW students_leaderboard AS
SELECT
  s.id,
  s.first_name,
  s.last_name,
  s.team_id,
  t.name as team_name,
  t.color as team_color,
  get_student_points(s.id) as points
FROM students s
LEFT JOIN teams t ON s.team_id = t.id
ORDER BY points DESC;

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_points ENABLE ROW LEVEL SECURITY;

-- Permetti lettura pubblica per tutti
CREATE POLICY "Allow public read on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read on quiz_scores" ON student_quiz_scores FOR SELECT USING (true);
CREATE POLICY "Allow public read on bonus_points" ON bonus_points FOR SELECT USING (true);

-- Permetti scrittura pubblica (in produzione si dovrebbe limitare agli admin autenticati)
CREATE POLICY "Allow public insert on teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow public insert on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on students" ON students FOR DELETE USING (true);

CREATE POLICY "Allow public insert on quiz_scores" ON student_quiz_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quiz_scores" ON student_quiz_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on quiz_scores" ON student_quiz_scores FOR DELETE USING (true);

CREATE POLICY "Allow public insert on bonus_points" ON bonus_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bonus_points" ON bonus_points FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on bonus_points" ON bonus_points FOR DELETE USING (true);
