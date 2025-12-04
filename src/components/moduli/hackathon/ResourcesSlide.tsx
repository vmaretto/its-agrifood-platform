'use client';

import React, { useState } from 'react';
import { SlideJSON, ToolCategory, QuickStartItem } from '@/types/module';

interface ResourcesSlideProps {
  slide: SlideJSON;
}

export function ResourcesSlide({ slide }: ResourcesSlideProps) {
  const vc = slide.visualContent || {};
  const toolCategories = vc.toolCategories as ToolCategory[] | undefined;
  const quickStart = vc.quickStart as QuickStartItem[] | undefined;
  const proTip = vc.proTip as { icon: string; title: string; text: string } | undefined;

  const [activeCategory, setActiveCategory] = useState(0);

  const difficultyColors: Record<string, string> = {
    'Facile': 'bg-green-100 text-green-700',
    'Media': 'bg-amber-100 text-amber-700',
    'Alta': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      {vc.introParagraph && (
        <p className="text-lg text-gray-600">{vc.introParagraph}</p>
      )}

      {/* Tool Categories - Tab Navigation */}
      {toolCategories && toolCategories.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {toolCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  idx === activeCategory
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Active Category Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolCategories[activeCategory]?.tools.map((tool, idx) => (
              <a
                key={idx}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {toolCategories[activeCategory].category.split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {tool.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColors[tool.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                      {tool.difficulty}
                    </span>
                    {tool.free === true && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                        Gratis
                      </span>
                    )}
                    {tool.free === 'Trial' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Trial
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
                <span className="text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0">
                  →
                </span>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Quick Start Guide */}
      {quickStart && quickStart.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <span>🚀</span>
            <span>Quick Start per Formato</span>
          </h3>
          <div className="space-y-3">
            {quickStart.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-4">
                <div className="font-bold text-emerald-600 w-20">{item.format}</div>
                <div className="flex-1 text-gray-700">{item.combo}</div>
                <div className="flex items-center gap-1 text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                  <span>⏱️</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tip */}
      {proTip && (
        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{proTip.icon}</span>
            <div>
              <h4 className="font-bold text-purple-800 text-lg">{proTip.title}</h4>
              <p className="text-purple-700 mt-1">{proTip.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Tutorials */}
      {slide.videos && slide.videos.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">📹 Video Tutorial</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slide.videos.map((video, idx) => (
              <a
                key={idx}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`h-24 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center`}>
                  <span className="text-3xl text-white">▶️</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm">{video.title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{video.source}</span>
                    <span>•</span>
                    <span>{video.duration}</span>
                    {video.language && (
                      <>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded">{video.language}</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourcesSlide;
