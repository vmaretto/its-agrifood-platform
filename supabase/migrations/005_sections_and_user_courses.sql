-- ============================================
-- Migration 005: Module Sections + User Course Access
-- ============================================

-- ============================================
-- 1. AGGIUNTA CAMPO SECTION AI MODULI
-- ============================================

-- Aggiungi campo section alla tabella modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS section VARCHAR(255);

-- Crea indice per performance nelle query per sezione
CREATE INDEX IF NOT EXISTS idx_modules_section ON modules(section);

-- Aggiorna i moduli esistenti con le sezioni appropriate
-- Modulo FoodTech Trend
UPDATE modules 
SET section = 'FoodTech Trend' 
WHERE id = 'tendenze-agrifoodtech' OR id LIKE '%agrifoodtech%' OR id LIKE '%foodtech%';

-- Moduli Blockchain
UPDATE modules 
SET section = 'Blockchain' 
WHERE id LIKE 'blockchain-food%' OR id LIKE '%blockchain%';

-- ============================================
-- 2. TABELLA USER_COURSES (Iscrizioni Studenti)
-- ============================================

CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enrolled_by VARCHAR(255) DEFAULT 'admin', -- chi ha iscritto lo studente
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, course_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_courses_user ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course ON user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_active ON user_courses(is_active);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica
CREATE POLICY "Allow public read on user_courses" ON user_courses FOR SELECT USING (true);

-- Scrittura pubblica (in produzione limitare agli admin)
CREATE POLICY "Allow public insert on user_courses" ON user_courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_courses" ON user_courses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on user_courses" ON user_courses FOR DELETE USING (true);

-- ============================================
-- 4. FUNZIONI HELPER
-- ============================================

-- Funzione per verificare se uno studente ha accesso a un corso
CREATE OR REPLACE FUNCTION user_has_course_access(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_courses 
    WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere i corsi di uno studente
CREATE OR REPLACE FUNCTION get_user_courses(p_user_id UUID)
RETURNS TABLE (
  course_id UUID,
  course_name VARCHAR,
  course_slug VARCHAR,
  course_icon VARCHAR,
  enrolled_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.icon,
    uc.enrolled_at
  FROM user_courses uc
  JOIN courses c ON c.id = uc.course_id
  WHERE uc.user_id = p_user_id 
  AND uc.is_active = true
  AND c.is_active = true
  ORDER BY uc.enrolled_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. VIEW PER GESTIONE ISCRIZIONI
-- ============================================

CREATE OR REPLACE VIEW course_enrollments AS
SELECT 
  uc.id,
  uc.user_id,
  s.first_name,
  s.last_name,
  s.email,
  uc.course_id,
  c.name as course_name,
  c.slug as course_slug,
  c.icon as course_icon,
  uc.enrolled_at,
  uc.enrolled_by,
  uc.is_active
FROM user_courses uc
JOIN students s ON s.id = uc.user_id
JOIN courses c ON c.id = uc.course_id
ORDER BY c.name, s.last_name, s.first_name;

-- View per studenti non iscritti a un corso specifico
CREATE OR REPLACE VIEW students_not_enrolled AS
SELECT 
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.email,
  c.id as course_id,
  c.name as course_name
FROM students s
CROSS JOIN courses c
WHERE NOT EXISTS (
  SELECT 1 FROM user_courses uc 
  WHERE uc.user_id = s.id 
  AND uc.course_id = c.id
  AND uc.is_active = true
);

-- ============================================
-- 6. MIGRAZIONE DATI ESISTENTI (opzionale)
-- Per studenti già associati a team di un corso,
-- creare automaticamente l'iscrizione al corso
-- ============================================

-- Iscrivi automaticamente gli studenti già in un team al corso del team
INSERT INTO user_courses (user_id, course_id, enrolled_by)
SELECT DISTINCT 
  s.id,
  t.course_id,
  'migration'
FROM students s
JOIN teams t ON s.team_id = t.id
WHERE t.course_id IS NOT NULL
ON CONFLICT (user_id, course_id) DO NOTHING;
