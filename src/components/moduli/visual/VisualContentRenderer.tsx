'use client';

import { VisualContent } from '@/types/module';
import { StatsGrid } from './StatsGrid';
import { TechCard } from './TechCard';
import { MiniQuiz } from './MiniQuiz';
import { Timeline } from './Timeline';
import { SupplyChainDiagram } from './SupplyChainDiagram';
import { FarmToForkTargets } from './FarmToForkTargets';
import { SuggestionBox } from './SuggestionBox';
import { HeroSection } from './HeroSection';
import { AlertBox } from './AlertBox';
import { StatBox } from './StatBox';
import { InfoBox } from './InfoBox';
import { ItemsList } from './ItemsList';
import { QuoteBlock } from './QuoteBlock';
import { ParagraphBlock } from './ParagraphBlock';
import { ESGSection } from './ESGSection';
import { ThemesList } from './ThemesList';

interface VisualContentRendererProps {
  content: VisualContent;
}

export function VisualContentRenderer({ content }: VisualContentRendererProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section se presente */}
      {(content.heroEmoji || content.heroTitle || content.heroDescription || content.heroBanner) && (
        <HeroSection
          emoji={content.heroEmoji}
          title={content.heroTitle}
          description={content.heroDescription}
          banner={content.heroBanner}
        />
      )}

      {/* Intro Paragraph se presente */}
      {content.introParagraph && (
        <ParagraphBlock text={content.introParagraph} className="text-lg" />
      )}

      {/* Stats Grid se presente */}
      {content.mainStats && content.mainStats.length > 0 && (
        <StatsGrid stats={content.mainStats} />
      )}

      {/* StatsGrid alternativo */}
      {content.statsGrid && content.statsGrid.length > 0 && (
        <StatsGrid stats={content.statsGrid} />
      )}

      {/* StatsRow */}
      {content.statsRow && content.statsRow.length > 0 && (
        <StatsGrid stats={content.statsRow} />
      )}

      {/* FinalStats */}
      {content.finalStats && content.finalStats.length > 0 && (
        <StatsGrid stats={content.finalStats} />
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

      {/* StatBox singolo */}
      {content.statBox && (
        <StatBox {...content.statBox} />
      )}

      {/* MainStat */}
      {content.mainStat && (
        <StatBox {...content.mainStat} variant="main" />
      )}

      {/* SecondaryStat */}
      {content.secondaryStat && (
        <StatBox {...content.secondaryStat} variant="secondary" />
      )}

      {/* Alert Box */}
      {content.alert && (
        <AlertBox {...content.alert} />
      )}

      {/* AlertBox alternativo */}
      {content.alertBox && (
        <AlertBox {...content.alertBox} />
      )}

      {/* Info Boxes */}
      {content.caseBox && (
        <InfoBox {...content.caseBox} type="case" />
      )}

      {content.aiBox && (
        <InfoBox {...content.aiBox} type="ai" />
      )}

      {content.advantageBox && (
        <InfoBox {...content.advantageBox} type="advantage" />
      )}

      {content.genZBox && (
        <InfoBox {...content.genZBox} type="genZ" />
      )}

      {/* Themes */}
      {content.themes && content.themes.length > 0 && (
        <ThemesList themes={content.themes} />
      )}

      {/* Liste strutturate */}
      {content.vantaggi && content.vantaggi.length > 0 && (
        <ItemsList items={content.vantaggi} variant="vantaggi" titleIcon="✨" title="Vantaggi" />
      )}

      {content.solutions && content.solutions.length > 0 && (
        <ItemsList items={content.solutions} variant="solutions" titleIcon="💡" title="Soluzioni" />
      )}

      {content.challenges && content.challenges.length > 0 && (
        <ItemsList items={content.challenges} variant="challenges" titleIcon="⚡" title="Sfide" />
      )}

      {content.trends && content.trends.length > 0 && (
        <ItemsList items={content.trends} variant="trends" titleIcon="📈" title="Trend" />
      )}

      {content.wineList && content.wineList.length > 0 && (
        <ItemsList items={content.wineList} titleIcon="🍷" title="Vini" />
      )}

      {/* ESG Items */}
      {content.esgItems && content.esgItems.length > 0 && (
        <ESGSection items={content.esgItems} />
      )}

      {/* Quote */}
      {content.quote && (
        <QuoteBlock {...content.quote} />
      )}
    </div>
  );
}

export default VisualContentRenderer;
