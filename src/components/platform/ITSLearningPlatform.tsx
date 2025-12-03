// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import HomeDashboard from './HomeDashboard';
import PercorsoView from './PercorsoView';
import PlaceholderView from './PlaceholderView';
import ModuloDinamico from '../moduli/ModuloDinamico';
import AdminNuovoModulo from './AdminNuovoModulo';
import AdminSquadre from './AdminSquadre';
import AuthPage from '../auth/AuthPage';
import { getModules, getModuleSync, deleteModule, getModulesSync } from '@/services/moduliStorage';
import { ModuleJSON } from '@/types/module';
import { getCurrentUser, signOut, UserProfile } from '@/services/authService';

// ============================================
// COMPONENTI ADMIN
// ============================================

const AdminDashboard = () => {
  const stats = [
    { label: 'Studenti iscritti', value: 24, icon: '👥', color: 'bg-blue-500' },
    { label: 'Moduli completati', value: 48, icon: '📚', color: 'bg-emerald-500' },
    { label: 'Quiz superati', value: 156, icon: '🧠', color: 'bg-purple-500' },
    { label: 'Ore di formazione', value: 320, icon: '⏱️', color: 'bg-amber-500' },
  ];

  const recentActivity = [
    { user: 'Marco Rossi', action: 'ha completato', target: 'Slide 5 - Sostenibilità', time: '5 min fa', icon: '✅' },
    { user: 'Laura Bianchi', action: 'ha iniziato', target: 'Trend Tecnologici 2026+', time: '12 min fa', icon: '▶️' },
    { user: 'Giuseppe Verdi', action: 'ha superato', target: 'Quiz Supply Chain', time: '1 ora fa', icon: '🏆' },
    { user: 'Anna Neri', action: 'ha commentato', target: 'Case Study Barilla', time: '2 ore fa', icon: '💬' },
  ];

  const squadreClassifica = [
    { nome: 'AgriTech Pioneers', punti: 850, membri: 6, trend: '+12%' },
    { nome: 'Farm Innovators', punti: 720, membri: 6, trend: '+8%' },
    { nome: 'Green Data', punti: 680, membri: 6, trend: '+5%' },
    { nome: 'Blockchain Farmers', punti: 590, membri: 6, trend: '+3%' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Admin</h1>
        <p className="text-gray-500">Panoramica del corso ITS AgriFood Academy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Attività Recente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">🕐 Attività Recente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-semibold">{activity.user}</span>
                    <span className="text-gray-500"> {activity.action} </span>
                    <span className="font-medium text-indigo-600">{activity.target}</span>
                  </div>
                  <div className="text-xs text-gray-400">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classifica Squadre */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">🏆 Classifica Squadre</h3>
          <div className="space-y-3">
            {squadreClassifica.map((squadra, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{squadra.nome}</div>
                  <div className="text-xs text-gray-500">{squadra.membri} membri</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{squadra.punti} pt</div>
                  <div className="text-xs text-emerald-600">{squadra.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progresso Moduli */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">📚 Progresso Moduli</h3>
        <div className="space-y-4">
          {[
            { nome: 'Tendenze AgrifoodTech', completati: 18, totali: 24, color: 'bg-emerald-500' },
            { nome: 'Trend Tecnologici 2026+', completati: 8, totali: 24, color: 'bg-indigo-500' },
            { nome: 'Blockchain per il Food', completati: 0, totali: 24, color: 'bg-purple-500' },
            { nome: 'Sostenibilità nel Food', completati: 0, totali: 24, color: 'bg-amber-500' },
          ].map((modulo, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{modulo.nome}</span>
                <span className="text-gray-500">{modulo.completati}/{modulo.totali} studenti</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${modulo.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(modulo.completati / modulo.totali) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminContenuti = ({ setActiveModule, onRefresh, onEditModule }: { setActiveModule?: (id: string) => void; onRefresh?: number; onEditModule?: (moduleId: string) => void }) => {
  const [modules, setModules] = React.useState<ModuleJSON[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Carica i moduli da Supabase
  React.useEffect(() => {
    const loadModules = async () => {
      setIsLoading(true);
      try {
        // Carica tutti i moduli da Supabase
        const allModules = await getModules();
        setModules(allModules);
      } catch (err) {
        console.error('Error loading modules:', err);
        setModules(getModulesSync());
      }
      setIsLoading(false);
    };
    loadModules();
  }, [onRefresh]);

  const handleDeleteModule = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo modulo?')) {
      await deleteModule(id);
      const allModules = await getModules();
      setModules(allModules);
    }
  };

  // Converti moduli nel formato della tabella
  const allModules = modules.map(m => ({
    id: m.id,
    nome: m.titolo,
    slides: m.slides?.length || 0,
    video: m.slides?.reduce((acc, s) => acc + (s.videos?.length || 0), 0) || 0,
    articoli: m.slides?.reduce((acc, s) => acc + (s.articles?.length || 0), 0) || 0,
    stato: 'pubblicato',
    icon: m.icon,
    hasNoteDocente: m.slides?.some(s => s.noteDocente) || false,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 Gestione Contenuti</h1>
          <p className="text-gray-500">
            {isLoading ? 'Caricamento...' : `${allModules.length} moduli totali`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Modulo</th>
              <th className="text-center p-4 font-semibold text-gray-600">Slide</th>
              <th className="text-center p-4 font-semibold text-gray-600">Video</th>
              <th className="text-center p-4 font-semibold text-gray-600">Articoli</th>
              <th className="text-center p-4 font-semibold text-gray-600">Note</th>
              <th className="text-right p-4 font-semibold text-gray-600">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Caricamento moduli...
                </td>
              </tr>
            ) : allModules.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Nessun modulo trovato
                </td>
              </tr>
            ) : (
              allModules.map((modulo, idx) => (
                <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {modulo.icon && <span>{modulo.icon}</span>}
                      <div>
                        <div className="font-medium text-gray-800">{modulo.nome}</div>
                        <div className="text-xs text-gray-500">ID: {modulo.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-gray-800">{modulo.slides}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-gray-800">{modulo.video}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-gray-800">{modulo.articoli}</span>
                  </td>
                  <td className="p-4 text-center">
                    {modulo.hasNoteDocente ? (
                      <span className="text-emerald-500" title="Note docente presenti">✅</span>
                    ) : (
                      <span className="text-gray-300" title="Nessuna nota">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {setActiveModule && (
                      <button
                        onClick={() => setActiveModule(modulo.id)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Apri
                      </button>
                    )}
                    {onEditModule && (
                      <button
                        onClick={() => onEditModule(modulo.id)}
                        className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-2"
                      >
                        Modifica
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteModule(modulo.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// AdminSquadre è ora importato da ./AdminSquadre

const AdminBadge = () => {
  const [badges, setBadges] = React.useState<import('@/services/badgesService').Badge[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingBadge, setEditingBadge] = React.useState<import('@/services/badgesService').Badge | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    icon: '🏆',
    criteria_type: 'manual' as 'manual' | 'points' | 'modules' | 'quizzes' | 'team' | 'slides',
    criteria_value: 0,
    points_reward: 0,
    is_active: true
  });

  // Carica i badge da Supabase
  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const { getBadges } = await import('@/services/badgesService');
      const data = await getBadges();
      setBadges(data);
    } catch (err) {
      console.error('Error loading badges:', err);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    loadBadges();
  }, []);

  // Apri modal per nuovo badge
  const handleNewBadge = () => {
    setEditingBadge(null);
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      criteria_type: 'manual',
      criteria_value: 0,
      points_reward: 0,
      is_active: true
    });
    setShowModal(true);
  };

  // Apri modal per modificare badge
  const handleEditBadge = (badge: import('@/services/badgesService').Badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon,
      criteria_type: badge.criteria_type,
      criteria_value: badge.criteria_value,
      points_reward: badge.points_reward,
      is_active: badge.is_active
    });
    setShowModal(true);
  };

  // Salva badge (crea o aggiorna)
  const handleSaveBadge = async () => {
    try {
      if (editingBadge) {
        const { updateBadge } = await import('@/services/badgesService');
        await updateBadge(editingBadge.id, formData);
      } else {
        const { createBadge } = await import('@/services/badgesService');
        await createBadge(formData);
      }
      setShowModal(false);
      loadBadges();
    } catch (err) {
      console.error('Error saving badge:', err);
      alert('Errore nel salvataggio del badge');
    }
  };

  // Elimina badge
  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo badge?')) return;
    try {
      const { deleteBadge } = await import('@/services/badgesService');
      await deleteBadge(id);
      loadBadges();
    } catch (err) {
      console.error('Error deleting badge:', err);
      alert('Errore nell\'eliminazione del badge');
    }
  };

  // Colori per tipo criterio
  const criteriaColors: Record<string, string> = {
    manual: 'bg-gray-100',
    points: 'bg-amber-100',
    modules: 'bg-blue-100',
    quizzes: 'bg-purple-100',
    team: 'bg-green-100',
    slides: 'bg-indigo-100'
  };

  const criteriaLabels: Record<string, string> = {
    manual: 'Manuale',
    points: 'Punti',
    modules: 'Moduli',
    quizzes: 'Quiz',
    team: 'Team',
    slides: 'Slide'
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎖️ Gestione Badge</h1>
          <p className="text-gray-500">
            {isLoading ? 'Caricamento...' : `${badges.length} badge configurati`}
          </p>
        </div>
        <button
          onClick={handleNewBadge}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
        >
          + Nuovo Badge
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Caricamento badge...</div>
      ) : badges.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nessun badge configurato. Clicca su "Nuovo Badge" per crearne uno.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className={`${criteriaColors[badge.criteria_type] || 'bg-gray-100'} rounded-2xl p-6`}>
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-3">{badge.icon}</div>
                {!badge.is_active && (
                  <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">Disattivo</span>
                )}
              </div>
              <div className="font-bold text-gray-800 mb-1">{badge.name}</div>
              <div className="text-sm text-gray-600 mb-2">{badge.description}</div>
              <div className="text-xs text-gray-500 mb-4">
                <span className="bg-white/50 px-2 py-1 rounded mr-2">
                  {criteriaLabels[badge.criteria_type]}: {badge.criteria_value}
                </span>
                <span className="bg-white/50 px-2 py-1 rounded">
                  +{badge.points_reward} pt
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{badge.times_awarded || 0} assegnati</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBadge(badge)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crea/Modifica Badge */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingBadge ? 'Modifica Badge' : 'Nuovo Badge'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icona</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-2xl text-center"
                      maxLength={4}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Nome del badge"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Descrizione del badge"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Criterio</label>
                    <select
                      value={formData.criteria_type}
                      onChange={e => setFormData({ ...formData, criteria_type: e.target.value as typeof formData.criteria_type })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="manual">Manuale</option>
                      <option value="points">Punti raggiunt</option>
                      <option value="modules">Moduli completati</option>
                      <option value="quizzes">Quiz corretti</option>
                      <option value="slides">Slide viste</option>
                      <option value="team">Membro di un team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valore Criterio</label>
                    <input
                      type="number"
                      value={formData.criteria_value}
                      onChange={e => setFormData({ ...formData, criteria_value: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punti Bonus</label>
                    <input
                      type="number"
                      value={formData.points_reward}
                      onChange={e => setFormData({ ...formData, points_reward: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={0}
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Badge attivo</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveBadge}
                  disabled={!formData.name}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {editingBadge ? 'Salva Modifiche' : 'Crea Badge'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AdminHackathon = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">💡 Setup Hackathon</h1>
        <p className="text-gray-500">Configura l hackathon finale del corso</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">📅 Dettagli Evento</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Nome Hackathon</label>
            <input 
              type="text" 
              defaultValue="AgriFood Innovation Challenge 2025"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Data</label>
            <input 
              type="date" 
              defaultValue="2025-01-15"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Descrizione</label>
            <textarea 
              rows={3}
              defaultValue="Progetta una soluzione innovativa per la tracciabilità e sostenibilità nel settore agroalimentare."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">🏆 Premi</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
            <span className="text-3xl">🥇</span>
            <div className="flex-1">
              <div className="font-semibold">1° Posto</div>
              <input 
                type="text" 
                defaultValue="Stage presso azienda partner + certificazione"
                className="w-full mt-1 px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
            <span className="text-3xl">🥈</span>
            <div className="flex-1">
              <div className="font-semibold">2° Posto</div>
              <input 
                type="text" 
                defaultValue="Corso avanzato gratuito + certificazione"
                className="w-full mt-1 px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-amber-100 rounded-xl">
            <span className="text-3xl">🥉</span>
            <div className="flex-1">
              <div className="font-semibold">3° Posto</div>
              <input 
                type="text" 
                defaultValue="Certificazione + menzione speciale"
                className="w-full mt-1 px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
            Salva Configurazione
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetAllStatistics = async () => {
    if (!confirm('⚠️ ATTENZIONE: Questa operazione resetterà TUTTE le statistiche di TUTTI gli studenti.\n\nVerranno eliminati:\n- Progressi dei moduli\n- Punteggi quiz\n- Punti bonus\n- Badge ottenuti\n- Attività recenti\n\nQuesta operazione NON è reversibile. Continuare?')) {
      return;
    }

    if (!confirm('Sei ASSOLUTAMENTE sicuro? Tutti i dati degli studenti verranno persi permanentemente.')) {
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    try {
      const { resetAllStatistics } = await import('@/services/progressService');
      const success = await resetAllStatistics();
      if (success) {
        setResetMessage({ type: 'success', text: 'Tutte le statistiche sono state resettate con successo.' });
      } else {
        setResetMessage({ type: 'error', text: 'Si è verificato un errore durante il reset.' });
      }
    } catch (err) {
      console.error('Error resetting statistics:', err);
      setResetMessage({ type: 'error', text: 'Errore di connessione durante il reset.' });
    }

    setIsResetting(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Impostazioni</h1>
        <p className="text-gray-500">Configura le impostazioni della piattaforma</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">🎨 Aspetto</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Colore primario</div>
                <div className="text-sm text-gray-500">Colore principale della piattaforma</div>
              </div>
              <input type="color" defaultValue="#10B981" className="w-12 h-10 rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Logo</div>
                <div className="text-sm text-gray-500">Logo visualizzato nella sidebar</div>
              </div>
              <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                Carica logo
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">🔔 Notifiche</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Email nuovi contenuti</div>
                <div className="text-sm text-gray-500">Notifica studenti quando pubblichi nuovi moduli</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Reminder scadenze</div>
                <div className="text-sm text-gray-500">Invia promemoria per quiz e sfide in scadenza</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">📊 Esportazione Dati</h3>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              📥 Esporta Studenti (CSV)
            </button>
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              📥 Esporta Progressi (CSV)
            </button>
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              📥 Report Completo (PDF)
            </button>
          </div>
        </div>

        {/* Zona Pericolo - Reset Statistiche */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-red-200">
          <h3 className="font-semibold text-red-700 mb-4">⚠️ Zona Pericolo</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="font-medium text-red-800 mb-2">Reset Statistiche</div>
              <p className="text-sm text-red-600 mb-4">
                Questa operazione eliminerà permanentemente tutti i progressi, punteggi, badge e attività di tutti gli studenti.
                Usa questa funzione solo per iniziare un nuovo anno accademico o per test.
              </p>
              {resetMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  resetMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {resetMessage.text}
                </div>
              )}
              <button
                onClick={handleResetAllStatistics}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Reset in corso...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Reset Tutte le Statistiche</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPALE
// ============================================

const ITSLearningPlatform: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Deriva il ruolo dall'utente autenticato
  const userRole = currentUser?.role === 'teacher' || currentUser?.role === 'admin' ? 'admin' : 'student';
  const isAdmin = userRole === 'admin';

  // Carica l'utente corrente all'avvio
  useEffect(() => {
    const loadUser = async () => {
      setIsAuthLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error loading user:', err);
      }
      setIsAuthLoading(false);
    };
    loadUser();
  }, []);

  // Handler per login riuscito
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  // Handler per logout
  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setCurrentView('home');
  };

  // Mostra loading durante il check auth iniziale
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">ITS</div>
          <div className="text-xl">AgriFood Academy</div>
          <div className="mt-4 animate-pulse">Caricamento...</div>
        </div>
      </div>
    );
  }

  // Se non autenticato, mostra pagina login
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Handler per editare un modulo
  const handleEditModule = (moduleId: string) => {
    setEditingModuleId(moduleId);
    setCurrentView('admin-nuovo-modulo');
  };

  // Render del modulo attivo - tutti i moduli sono su Supabase
  const renderActiveModule = () => {
    if (!activeModule) return null;

    const dynamicModule = getModuleSync(activeModule);
    if (dynamicModule) {
      return (
        <ModuloDinamico
          module={dynamicModule}
          onBack={() => setActiveModule(null)}
          isAdmin={isAdmin}
          userRole={userRole}
          currentUser={currentUser}
        />
      );
    }
    return null;
  };

  // Se c'è un modulo attivo, mostra il modulo a schermo intero
  if (activeModule) {
    const moduleComponent = renderActiveModule();
    if (moduleComponent) {
      return moduleComponent;
    }
  }

  // Render della vista corrente
  const renderView = () => {
    switch (currentView) {
      // Viste Studente
      case 'home':
        return (
          <HomeDashboard
            setCurrentView={setCurrentView}
            setActiveModule={setActiveModule}
            currentUser={currentUser}
          />
        );
      case 'percorso':
        return <PercorsoView setActiveModule={setActiveModule} currentUser={currentUser} />;
      case 'sfide':
        return <PlaceholderView title="Sfide & Competizioni" icon="🏆" />;
      case 'tutor':
        return <PlaceholderView title="AI Tutor" icon="🤖" />;
      case 'hackathon':
        return <PlaceholderView title="Hackathon Space" icon="💡" />;
      
      // Viste Admin
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-contenuti':
        return <AdminContenuti setActiveModule={setActiveModule} onEditModule={handleEditModule} />;
      case 'admin-squadre':
        return <AdminSquadre />;
      case 'admin-badge':
        return <AdminBadge />;
      case 'admin-hackathon':
        return <AdminHackathon />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'admin-nuovo-modulo':
        return <AdminNuovoModulo
          editModuleId={editingModuleId}
          onModuleCreated={() => {
            setEditingModuleId(null);
            setCurrentView('admin-contenuti');
          }}
          onCancel={() => {
            setEditingModuleId(null);
            setCurrentView('admin-contenuti');
          }}
        />;

      default:
        return (
          <HomeDashboard
            setCurrentView={setCurrentView}
            setActiveModule={setActiveModule}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={userRole}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto">{renderView()}</div>
    </div>
  );
};

export default ITSLearningPlatform;
