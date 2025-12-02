'use client';

import { useState } from 'react';
import { SupplyChainStage } from '@/types/module';

interface SupplyChainDiagramProps {
  stages: SupplyChainStage[];
}

export function SupplyChainDiagram({ stages }: SupplyChainDiagramProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-6">
      <div className="text-center mb-4">
        <span className="text-sm text-emerald-600 font-medium">
          👆 Clicca su ogni nodo per esplorare
        </span>
      </div>
      <div className="relative h-32">
        <div className="absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-full" />
        {stages.map((stage, idx) => (
          <div
            key={stage.name}
            className={`absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              activeNode === stage.name ? 'scale-125 z-10' : 'hover:scale-110'
            }`}
            style={{ left: `${(idx / (stages.length - 1)) * 85 + 5}%` }}
            onClick={() =>
              setActiveNode(activeNode === stage.name ? null : stage.name)
            }
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all ${
                activeNode === stage.name
                  ? 'bg-emerald-500 text-white shadow-emerald-300'
                  : 'bg-white'
              }`}
            >
              {stage.icon}
            </div>
            <div className="text-xs text-center mt-2 font-medium text-gray-700">
              {stage.name}
            </div>
          </div>
        ))}
      </div>
      {activeNode && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-sm animate-fadeIn">
          <p className="text-gray-700">
            {stages.find((s) => s.name === activeNode)?.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default SupplyChainDiagram;
