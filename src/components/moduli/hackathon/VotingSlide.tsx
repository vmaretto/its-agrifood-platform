'use client';

import React, { useState, useEffect } from 'react';
import { SlideJSON, VotingCriterion, Prize } from '@/types/module';
import { getTeams, Team } from '@/services/teamsService';
import {
  submitTeamVotes,
  getVoterVotes,
  hasStudentVoted,
  getVotesSummary,
  getJuryMembers,
  addJuryMember,
  removeJuryMember,
  isHackathonFinalized,
  finalizeHackathon,
  POINTS_PER_STAR,
  HackathonVote,
  JuryMember,
  TeamVotesSummary,
  FinalizeResult
} from '@/services/hackathonVotingService';
import { UserProfile } from '@/services/authService';

interface VotingSlideProps {
  slide: SlideJSON;
  hackathonId?: string;
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
}

interface VotingSystem {
  juryWeight: number;
  peerWeight: number;
  juryMembers: { role: string; icon: string; votes: number; weight: number }[];
  peerVoting: {
    enabled: boolean;
    rules: string[];
  };
}

interface TeamVotes {
  [criterionId: string]: number;
}

export function VotingSlide({ slide, hackathonId = 'hackathon-winetech-2024', isAdmin = false, currentUser }: VotingSlideProps) {
  const vc = slide.visualContent || {};
  const votingSystem = vc.votingSystem as VotingSystem | undefined;
  const votingCriteria = vc.votingCriteria as VotingCriterion[] | undefined;
  const prizes = vc.prizes as Prize[] | undefined;

  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamVotes, setTeamVotes] = useState<TeamVotes>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  const [existingVotes, setExistingVotes] = useState<HackathonVote[]>([]);
  const [votesSummary, setVotesSummary] = useState<TeamVotesSummary[]>([]);
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([]);
  const [showAddJury, setShowAddJury] = useState(false);
  const [newJuryName, setNewJuryName] = useState('');
  const [newJuryRole, setNewJuryRole] = useState('');
  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'jury'>('vote');
  const [isFinalized, setIsFinalized] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeResults, setFinalizeResults] = useState<FinalizeResult[] | null>(null);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const voterType = isTeacher ? 'teacher' : 'student';

  // Carica dati iniziali
  useEffect(() => {
    const loadData = async () => {
      // Carica squadre
      const teamsData = await getTeams();
      setTeams(teamsData);

      // Carica giurati
      const juryData = await getJuryMembers(hackathonId);
      setJuryMembers(juryData);

      // Carica riepilogo voti
      const summary = await getVotesSummary(hackathonId);
      setVotesSummary(summary);

      // Controlla se hackathon è già finalizzato
      const finalized = await isHackathonFinalized(hackathonId);
      setIsFinalized(finalized);

      // Se è uno studente, controlla se ha già votato
      if (currentUser && !isTeacher) {
        const voteStatus = await hasStudentVoted(hackathonId, currentUser.id);
        setHasVoted(voteStatus.hasVoted);
        setVotedTeamId(voteStatus.votedTeamId);
      }

      // Carica voti esistenti dell'utente
      if (currentUser) {
        const votes = await getVoterVotes(hackathonId, currentUser.id);
        setExistingVotes(votes);
      }
    };

    loadData();
  }, [hackathonId, currentUser, isTeacher]);

  // Quando si seleziona una squadra, carica i voti esistenti
  useEffect(() => {
    if (selectedTeam && existingVotes.length > 0) {
      const teamExistingVotes = existingVotes.filter(v => v.team_id === selectedTeam.id);
      const votes: TeamVotes = {};
      teamExistingVotes.forEach(v => {
        votes[v.criterion_id] = v.score;
      });
      setTeamVotes(votes);
    } else {
      setTeamVotes({});
    }
  }, [selectedTeam, existingVotes]);

  // Gestisce il click sulle stelle
  const handleStarClick = (criterionId: string, score: number) => {
    // Se studente ha già votato e sta cercando di votare per un'altra squadra, blocca
    if (!isTeacher && hasVoted && selectedTeam?.id !== votedTeamId) {
      return;
    }
    setTeamVotes(prev => ({ ...prev, [criterionId]: score }));
  };

  // Sottometti i voti
  const handleSubmitVotes = async () => {
    if (!selectedTeam || !currentUser || !votingCriteria) return;

    // Verifica che tutti i criteri siano stati votati
    const allVoted = votingCriteria.every(c => teamVotes[c.id] !== undefined && teamVotes[c.id] > 0);
    if (!allVoted) {
      alert('Devi votare tutti i criteri prima di inviare');
      return;
    }

    setIsSubmitting(true);

    const votes = Object.entries(teamVotes).map(([criterionId, score]) => ({
      criterionId,
      score
    }));

    const success = await submitTeamVotes(
      hackathonId,
      selectedTeam.id,
      currentUser.id,
      voterType,
      votes
    );

    if (success) {
      // Aggiorna stato
      if (!isTeacher) {
        setHasVoted(true);
        setVotedTeamId(selectedTeam.id);
      }

      // Ricarica riepilogo
      const summary = await getVotesSummary(hackathonId);
      setVotesSummary(summary);

      // Ricarica voti esistenti
      const allVotes = await getVoterVotes(hackathonId, currentUser.id);
      setExistingVotes(allVotes);

      alert('Voti salvati con successo!');
      setSelectedTeam(null);
    } else {
      alert('Errore nel salvataggio dei voti');
    }

    setIsSubmitting(false);
  };

  // Aggiungi giurato
  const handleAddJury = async () => {
    if (!newJuryName.trim() || !currentUser) return;

    const jury = await addJuryMember(
      hackathonId,
      newJuryName.trim(),
      newJuryRole.trim() || 'Giurato',
      '👔',
      currentUser.id
    );

    if (jury) {
      setJuryMembers(prev => [...prev, jury]);
      setNewJuryName('');
      setNewJuryRole('');
      setShowAddJury(false);
    }
  };

  // Rimuovi giurato
  const handleRemoveJury = async (juryId: string) => {
    if (confirm('Sei sicuro di voler rimuovere questo giurato?')) {
      const success = await removeJuryMember(juryId);
      if (success) {
        setJuryMembers(prev => prev.filter(j => j.id !== juryId));
      }
    }
  };

  // Finalizza hackathon e assegna punti
  const handleFinalizeHackathon = async () => {
    if (!isTeacher || isFinalized) return;

    setIsFinalizing(true);
    const hackathonName = slide.title || 'Hackathon';
    const result = await finalizeHackathon(hackathonId, hackathonName);

    if (result.success) {
      setIsFinalized(true);
      setFinalizeResults(result.results);
      setShowFinalizeConfirm(false);
    } else {
      alert('Errore nella finalizzazione. L\'hackathon potrebbe essere già stato finalizzato.');
    }

    setIsFinalizing(false);
  };

  // Calcola punti totali per la squadra selezionata
  const calculateTotalPoints = () => {
    if (!votingCriteria) return 0;
    return Object.values(teamVotes).reduce((sum, score) => sum + score * POINTS_PER_STAR, 0);
  };

  // Filtra squadre votabili per studenti (non la propria)
  const votableTeams = teams.filter(team => {
    if (isTeacher) return true;
    // Gli studenti non possono votare la propria squadra
    if (currentUser) {
      const studentTeam = teams.find(t =>
        t.id === (currentUser as UserProfile & { team_id?: string }).team_id
      );
      return team.id !== studentTeam?.id;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('vote')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'vote'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🗳️ Vota
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'results'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Risultati
        </button>
        {isTeacher && (
          <button
            onClick={() => setActiveTab('jury')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'jury'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👔 Giuria
          </button>
        )}
      </div>

      {/* TAB: VOTA */}
      {activeTab === 'vote' && (
        <div className="space-y-6">
          {/* Intro */}
          {vc.introParagraph && (
            <p className="text-lg text-gray-600">{String(vc.introParagraph)}</p>
          )}

          {/* Messaggio per studenti che hanno già votato */}
          {!isTeacher && hasVoted && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-amber-800">Hai già votato!</p>
                  <p className="text-sm text-amber-600">
                    Puoi votare una sola volta. Hai votato per:{' '}
                    <strong>{teams.find(t => t.id === votedTeamId)?.name || 'Squadra'}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selezione Squadra */}
          {(!hasVoted || isTeacher) && (
            <>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {isTeacher ? 'Seleziona la squadra da votare' : 'Vota per una squadra (non la tua)'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {votableTeams.map(team => {
                    const hasExistingVotes = existingVotes.some(v => v.team_id === team.id);
                    return (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedTeam?.id === team.id
                            ? 'ring-2 ring-offset-2 shadow-lg scale-105'
                            : 'bg-white border-2 border-gray-100 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: selectedTeam?.id === team.id ? `${team.color}20` : undefined,
                          '--tw-ring-color': team.color
                        } as React.CSSProperties}
                      >
                        <div
                          className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name.charAt(0)}
                        </div>
                        <div className="font-semibold text-gray-800">{team.name}</div>
                        {hasExistingVotes && (
                          <span className="text-xs text-emerald-600">✓ Votato</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form di votazione */}
              {selectedTeam && votingCriteria && (
                <div
                  className="bg-white rounded-2xl p-6 shadow-lg border-2"
                  style={{ borderColor: selectedTeam.color }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: selectedTeam.color }}
                    >
                      {selectedTeam.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedTeam.name}</h3>
                      <p className="text-sm text-gray-500">
                        Clicca sulle stelle per assegnare il punteggio
                      </p>
                    </div>
                  </div>

                  {/* Criteri con stelle */}
                  <div className="space-y-4">
                    {votingCriteria.map(criterion => (
                      <div
                        key={criterion.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{criterion.emoji}</span>
                          <div>
                            <div className="font-semibold text-gray-800">{criterion.name}</div>
                            <div className="text-xs text-gray-500">{criterion.description}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(criterion.maxScore)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => handleStarClick(criterion.id, i + 1)}
                              className={`text-2xl transition-transform hover:scale-110 ${
                                teamVotes[criterion.id] !== undefined && i < teamVotes[criterion.id]
                                  ? 'text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totale e Submit */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-gray-600">
                      Punti assegnati:{' '}
                      <span className="font-bold text-indigo-600 text-xl">
                        {calculateTotalPoints()} pt
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedTeam(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleSubmitVotes}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Salvataggio...' : 'Conferma Voti'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: RISULTATI */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {isFinalized ? 'Classifica Finale' : 'Classifica Parziale'}
            </h3>
            {isFinalized && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ✓ Hackathon Finalizzato
              </span>
            )}
          </div>

          {/* Classifica */}
          <div className="space-y-3">
            {votesSummary.map((team, idx) => (
              <div
                key={team.team_id}
                className={`flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm ${
                  idx < 3 ? 'ring-2 ring-offset-1' : 'border border-gray-100'
                }`}
                style={{
                  '--tw-ring-color': idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#92400e' : 'transparent'
                } as React.CSSProperties}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{
                    backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#92400e' : team.team_color
                  }}
                >
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{team.team_name}</div>
                  <div className="text-xs text-gray-500">
                    Giuria: {team.jury_total_stars}⭐ ({team.jury_votes_count} voti) ·
                    Peer: {team.peer_total_stars}⭐ ({team.peer_votes_count} voti)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-2xl text-indigo-600">{team.total_points}</div>
                  <div className="text-xs text-gray-500">punti</div>
                </div>
              </div>
            ))}

            {votesSummary.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nessun voto ancora registrato
              </div>
            )}
          </div>

          {/* Info premi */}
          {prizes && prizes.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                <span>🏆</span>
                <span>Premi in Palio</span>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {prizes.slice(0, 3).map((prize, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl p-4 text-center ${
                      idx === 0 ? 'ring-2 ring-amber-400 shadow-lg' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">{prize.position}</div>
                    <div className="font-bold text-gray-800">{prize.label}</div>
                    <div className="text-2xl font-bold text-amber-600 mt-2">+{prize.points}</div>
                    <div className="text-sm text-gray-500">punti</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pulsante Finalizza (solo docente) */}
          {isTeacher && !isFinalized && votesSummary.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                    <span>🏁</span>
                    Finalizza Hackathon
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    Assegna i punti finali a tutti gli studenti delle squadre
                  </p>
                </div>
                <button
                  onClick={() => setShowFinalizeConfirm(true)}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                >
                  🏆 Finalizza e Assegna Punti
                </button>
              </div>
            </div>
          )}

          {/* Risultati finalizzazione */}
          {finalizeResults && finalizeResults.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                Riepilogo Punti Assegnati
              </h3>
              <div className="space-y-3">
                {finalizeResults.map((result) => (
                  <div
                    key={result.team_id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : result.position === 3 ? '🥉' : `${result.position}°`}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-800">{result.team_name}</div>
                        <div className="text-xs text-gray-500">
                          {result.members_count} membri · {result.vote_points} voti + {result.prize_points} premio
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-indigo-600">
                        {result.points_per_member} pt/studente
                      </div>
                      <div className="text-xs text-gray-500">
                        Totale: {result.total_points} pt
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal conferma finalizzazione */}
          {showFinalizeConfirm && (
            <>
              <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFinalizeConfirm(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Conferma Finalizzazione</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-800 font-medium">
                        ⚠️ Attenzione: questa azione non può essere annullata!
                      </p>
                      <p className="text-sm text-amber-600 mt-2">
                        I punti verranno assegnati permanentemente a tutti gli studenti delle squadre.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Anteprima distribuzione punti:</h4>
                      {votesSummary.slice(0, 5).map((team, idx) => {
                        const position = idx + 1;
                        const prizePoints = position <= 3 ? [2000, 1000, 500][position - 1] : 0;
                        const total = team.total_points + prizePoints;
                        return (
                          <div key={team.team_id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                            <span>{position}° - {team.team_name}</span>
                            <span className="font-medium">
                              {team.total_points} + {prizePoints} = {total} pt
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t p-4 bg-gray-50 flex gap-2">
                    <button
                      onClick={() => setShowFinalizeConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleFinalizeHackathon}
                      disabled={isFinalizing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isFinalizing ? 'Assegnazione in corso...' : '✓ Conferma e Assegna'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: GIURIA (solo docente) */}
      {activeTab === 'jury' && isTeacher && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Gestione Giuria</h3>
            <button
              onClick={() => setShowAddJury(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Aggiungi Giurato
            </button>
          </div>

          {/* Lista giurati */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {juryMembers.map(jury => (
              <div key={jury.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{jury.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{jury.name}</div>
                      <div className="text-xs text-gray-500">{jury.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveJury(jury.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {juryMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              Nessun giurato aggiunto. Clicca su &quot;Aggiungi Giurato&quot; per iniziare.
            </div>
          )}

          {/* Modal Aggiungi Giurato */}
          {showAddJury && (
            <>
              <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddJury(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Aggiungi Giurato</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                      <input
                        type="text"
                        value={newJuryName}
                        onChange={e => setNewJuryName(e.target.value)}
                        placeholder="Es. Mario Rossi"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ruolo</label>
                      <input
                        type="text"
                        value={newJuryRole}
                        onChange={e => setNewJuryRole(e.target.value)}
                        placeholder="Es. Esperto di Marketing"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="border-t p-4 bg-gray-50 flex gap-2">
                    <button
                      onClick={() => setShowAddJury(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleAddJury}
                      disabled={!newJuryName.trim()}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Aggiungi
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Voting System Overview */}
          {votingSystem && (
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                    <span>👔</span>
                    <span>Giuria</span>
                  </h3>
                  <span className="text-3xl font-bold text-purple-600">{votingSystem.juryWeight}%</span>
                </div>
                <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${votingSystem.juryWeight}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                    <span>👥</span>
                    <span>Peer Voting</span>
                  </h3>
                  <span className="text-3xl font-bold text-emerald-600">{votingSystem.peerWeight}%</span>
                </div>
                <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${votingSystem.peerWeight}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Alert */}
      {vc.alertBox && (
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{(vc.alertBox as { icon?: string }).icon}</span>
            <div>
              <h4 className="font-bold text-lg text-blue-800">{(vc.alertBox as { title?: string }).title}</h4>
              <p
                className="mt-1 text-blue-700"
                dangerouslySetInnerHTML={{ __html: (vc.alertBox as { text?: string }).text || '' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VotingSlide;
