'use client';

import React, { useState, useEffect } from 'react';
import { getHackathonConfig, upsertHackathonConfig, HackathonConfig } from '@/services/hackathonConfigService';

interface AdminHackathonConfigProps {
  courseId?: string;
  onBack?: () => void;
}

export default function AdminHackathonConfig({ courseId, onBack }: AdminHackathonConfigProps) {
  const [config, setConfig] = useState<HackathonConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadConfig();
    }
  }, [courseId]);

  const loadConfig = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    const data = await getHackathonConfig(courseId);
    
    if (data) {
      setConfig(data);
      // Parse datetime
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
      setIsActive(data.is_active);
    } else {
      // Default: oggi dalle 9 alle 14
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setStartTime('09:00');
      setEndDate(today);
      setEndTime('14:00');
    }
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!courseId) return;
    
    setIsSaving(true);
    setMessage(null);

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    // Validazione
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setMessage({ type: 'error', text: 'La data/ora di fine deve essere dopo quella di inizio' });
      setIsSaving(false);
      return;
    }

    const result = await upsertHackathonConfig(courseId, startDateTime, endDateTime, isActive);

    if (result) {
      setConfig(result);
      setMessage({ type: 'success', text: 'Configurazione salvata!' });
    } else {
      setMessage({ type: 'error', text: 'Errore nel salvataggio' });
    }

    setIsSaving(false);
  };

  // Calcola durata
  const calculateDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    
    if (diffMs <= 0) return null;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Controlla se l'hackathon è in corso
  const getStatus = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    
    const now = new Date();
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (now < start) return { label: 'Non iniziato', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (now >= end) return { label: 'Terminato', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { label: 'In corso', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  const status = getStatus();
  const duration = calculateDuration();

  if (!courseId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Seleziona un corso per configurare l'hackathon
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Caricamento configurazione...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Indietro
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">⏱️ Configura Countdown</h1>
        <div></div>
      </div>

      {/* Status Badge */}
      {status && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${status.bg}`}>
          <span className={`w-2 h-2 rounded-full ${status.label === 'In corso' ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'}`}></span>
          <span className={`font-medium ${status.color}`}>{status.label}</span>
          {duration && <span className="text-gray-500">• Durata: {duration}</span>}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {/* Inizio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🚀 Inizio Hackathon
          </label>
          <div className="flex gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Fine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏁 Fine Hackathon
          </label>
          <div className="flex gap-3">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Attivo */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div>
            <div className="font-medium text-gray-800">Mostra Countdown</div>
            <div className="text-sm text-gray-500">Se disattivato, il countdown non sarà visibile</div>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isActive ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                isActive ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-500 mb-3">
            Preset Rapidi
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                setStartTime('09:00');
                setEndTime('14:00');
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              Oggi 9-14
            </button>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                setStartTime('14:00');
                setEndTime('18:00');
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              Oggi 14-18
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const currentTime = now.toTimeString().slice(0, 5);
                const endHour = Math.min(now.getHours() + 3, 23);
                const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                setStartDate(today);
                setEndDate(today);
                setStartTime(currentTime);
                setEndTime(endTimeStr);
              }}
              className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm transition-colors"
            >
              Inizia ORA (3h)
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors"
        >
          {isSaving ? 'Salvataggio...' : '💾 Salva Configurazione'}
        </button>
      </div>
    </div>
  );
}
