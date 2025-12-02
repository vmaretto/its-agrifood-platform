'use client';

import { VisualContent } from '@/types/module';
import { StatsGrid } from './StatsGrid';
import { TechCard } from './TechCard';
import { MiniQuiz } from './MiniQuiz';
import { Timeline } from './Timeline';
import { SupplyChainDiagram } from './SupplyChainDiagram';
import { FarmToForkTargets } from './FarmToForkTargets';
import { SuggestionBox } from './SuggestionBox';
import { ProgressBar } from './ProgressBar';

interface VisualContentRendererProps {
  content: VisualContent;
}

export function VisualContentRenderer({ content }: VisualContentRendererProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid se presente */}
      {content.mainStats && content.mainStats.length > 0 && (
        <StatsGrid stats={content.mainStats} />
      )}

      {/* Preferences (come stats) se presente */}
      {content.preferences && content.preferences.length > 0 && (
        <StatsGrid stats={content.preferences} />
      )}

      {/* Technologies se presente */}
      {content.technologies && content.technologies.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {content.technologies.map((tech, idx) => (
            <TechCard key={idx} {...tech} />
          ))}
        </div>
      )}

      {/* Timeline se presente */}
      {content.timeline && content.timeline.length > 0 && (
        <Timeline items={content.timeline} />
      )}

      {/* Supply Chain se presente */}
      {content.supplyChain && content.supplyChain.length > 0 && (
        <SupplyChainDiagram stages={content.supplyChain} />
      )}

      {/* Farm to Fork Targets se presente */}
      {content.farmToForkTargets && content.farmToForkTargets.length > 0 && (
        <FarmToForkTargets targets={content.farmToForkTargets} />
      )}

      {/* Quiz se presente */}
      {content.quiz && (
        <MiniQuiz
          question={content.quiz.question}
          options={content.quiz.options}
          correctIndex={content.quiz.correctIndex}
          explanation={content.quiz.explanation}
        />
      )}

      {/* Sections se presente */}
      {content.sections && content.sections.length > 0 && (
        <div className="space-y-4">
          {content.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                {section.icon && <span className="text-xl">{section.icon}</span>}
                <h3 className="font-semibold text-gray-800">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions se presente */}
      {content.suggestions && content.suggestions.length > 0 && (
        <div className="space-y-4">
          {content.suggestions.map((sug, idx) => (
            <SuggestionBox key={idx} {...sug} />
          ))}
        </div>
      )}

      {/* Institutional Sources se presente */}
      {content.institutionalSources && content.institutionalSources.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏛️</span>
            <h3 className="font-semibold text-gray-800">Fonti Istituzionali</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {content.institutionalSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="text-3xl">{source.icon || '🔗'}</span>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {source.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualContentRenderer;
