'use client';

import React from 'react';
import { SlideJSON, VotingCriterion, Prize } from '@/types/module';

interface VotingSlideProps {
  slide: SlideJSON;
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

export function VotingSlide({ slide }: VotingSlideProps) {
  const vc = slide.visualContent || {};
  const votingSystem = vc.votingSystem as VotingSystem | undefined;
  const votingCriteria = vc.votingCriteria as VotingCriterion[] | undefined;
  const prizes = vc.prizes as Prize[] | undefined;

  return (
    <div className="space-y-8">
      {/* Intro */}
      {vc.introParagraph && (
        <p className="text-lg text-gray-600">{vc.introParagraph}</p>
      )}

      {/* Voting System Overview */}
      {votingSystem && (
        <div className="grid grid-cols-2 gap-6">
          {/* Jury */}
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
            <div className="mt-4 space-y-2">
              {votingSystem.juryMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <span className="text-2xl">{member.icon}</span>
                  <span className="font-medium text-gray-700">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Voting */}
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
            {votingSystem.peerVoting?.rules && (
              <div className="mt-4 space-y-2">
                {votingSystem.peerVoting.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-emerald-700 text-sm">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voting Criteria */}
      {votingCriteria && votingCriteria.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Criteri di Voto</h3>
          <div className="grid grid-cols-5 gap-4">
            {votingCriteria.map((criterion, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-2">
                  {criterion.emoji}
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">{criterion.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{criterion.description}</p>
                <div className="mt-2 flex justify-center gap-0.5">
                  {[...Array(criterion.maxScore)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prizes */}
      {prizes && prizes.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
            <span>🏆</span>
            <span>Premi</span>
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Top 3 */}
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
                <div className="mt-3 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {prize.badge}
                </div>
              </div>
            ))}
          </div>

          {/* Special Awards */}
          {prizes.length > 3 && (
            <div className="border-t border-amber-200 pt-4 mt-4">
              <h4 className="font-semibold text-amber-800 mb-3">🌟 Premi Speciali</h4>
              <div className="grid grid-cols-3 gap-3">
                {prizes.slice(3).map((prize, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <span className="text-2xl">{prize.position}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{prize.label}</div>
                      <div className="text-xs text-gray-500">{prize.badge}</div>
                    </div>
                    <div className="text-lg font-bold text-amber-600">+{prize.points}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alert Box */}
      {vc.alertBox && (
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{vc.alertBox.icon}</span>
            <div>
              <h4 className="font-bold text-lg text-blue-800">{vc.alertBox.title}</h4>
              <p
                className="mt-1 text-blue-700"
                dangerouslySetInnerHTML={{ __html: vc.alertBox.text || '' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VotingSlide;
