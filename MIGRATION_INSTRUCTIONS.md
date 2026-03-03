# Istruzioni Migrazione Database

## Migrazione 005: Sezioni Moduli + Accesso Corsi

Questa migrazione aggiunge:

1. **Campo `section` ai moduli** - per raggruppare i moduli per sezione nella UI
2. **Tabella `user_courses`** - per gestire quali studenti hanno accesso a quali corsi

### Come Eseguire

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard/project/pwhqkdivgumrsubpinrv/sql)
2. Apri SQL Editor
3. Copia e incolla il contenuto del file `supabase/migrations/005_sections_and_user_courses.sql`
4. Clicca "Run"

### Cosa Cambia

#### Per i Moduli
- I moduli possono ora avere un campo `section` (es. "FoodTech Trend", "Blockchain")
- Nella vista Percorso, i moduli sono raggruppati per sezione con header visivi colorati

#### Per gli Studenti
- Gli studenti vedono solo i corsi a cui sono iscritti
- I docenti/admin vedono tutti i corsi
- C'è una nuova sezione "Iscrizioni" nel menu admin per gestire le iscrizioni

### Moduli da Aggiornare

Dopo la migrazione, aggiorna i seguenti moduli con le loro sezioni:

```sql
-- Moduli FoodTech Trend
UPDATE modules SET section = 'FoodTech Trend' 
WHERE id = 'tendenze-agrifoodtech' OR id LIKE '%agrifoodtech%';

-- Moduli Blockchain
UPDATE modules SET section = 'Blockchain' 
WHERE id LIKE 'blockchain-food%';
```

### Verifica

Dopo la migrazione, verifica che:
1. La colonna `section` esiste in `modules`
2. La tabella `user_courses` esiste
3. Le policy RLS sono attive
