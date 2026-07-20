'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import {
  getBaseCase,
  getUpsideCase,
  getDownsideCase,
  computeForecast,
  type ForecastAssumptions,
  type ForecastResult,
} from '@/lib/forecast/scenarios';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const getBorder = (label: string) => {
  if (label === 'Base Case') return 'border-blue-300 bg-blue-50';
  if (label === 'Upside Case') return 'border-emerald-300 bg-emerald-50';
  if (label === 'Downside Case') return 'border-orange-300 bg-orange-50';
  return 'border-purple-300 bg-purple-50';
};

function ForecastCard({ forecast }: { forecast: ForecastResult }) {
  return (
    <div className={`border-2 ${getBorder(forecast.label)} rounded-lg p-6`}>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{forecast.label}</h3>

      {/* Assumptions */}
      <div className="mb-6 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Assumptions
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Rent Growth:</span>
            <span className="ml-2 font-medium text-gray-900">
              {formatPercent(forecast.assumptions.rentGrowthRate)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Vacancy:</span>
            <span className="ml-2 font-medium text-gray-900">
              {formatPercent(forecast.assumptions.vacancyRate)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Expense Growth:</span>
            <span className="ml-2 font-medium text-gray-900">
              {formatPercent(forecast.assumptions.expenseGrowthRate)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Exit Cap:</span>
            <span className="ml-2 font-medium text-gray-900">
              {formatPercent(forecast.assumptions.exitCapRate)}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Hold Period:</span>
            <span className="ml-2 font-medium text-gray-900">
              {forecast.assumptions.holdPeriodYears} years
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Projected Results
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600">Year 5 NOI</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(forecast.year5Noi)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600">Year 5 Value</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(forecast.year5Value)}
            </span>
          </div>
          <div className="flex justify-between items-baseline border-t pt-3">
            <span className="text-gray-700 font-medium">IRR</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPercent(forecast.irr)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-gray-700 font-medium">MOIC</span>
            <span className="text-2xl font-bold text-gray-900">
              {forecast.moic.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  const { simulation } = useSimulationStore();

  const [customAssumptions, setCustomAssumptions] = useState<ForecastAssumptions>({
    rentGrowthRate: 0.03,
    vacancyRate: 0.05,
    expenseGrowthRate: 0.025,
    exitCapRate: 0.055,
    holdPeriodYears: 5,
  });

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Simulation</h2>
          <p className="text-gray-600">Start a simulation to view forecasts.</p>
        </div>
      </div>
    );
  }

  const baseCase = getBaseCase(simulation.property, simulation.partnershipTerms);
  const upsideCase = getUpsideCase(simulation.property, simulation.partnershipTerms);
  const downsideCase = getDownsideCase(simulation.property, simulation.partnershipTerms);
  const customCase = {
    ...computeForecast(simulation.property, simulation.partnershipTerms, customAssumptions),
    label: 'Custom Case',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Forecast Scenarios</h1>
          <p className="text-gray-600 mt-1">
            {simulation.property.name} | Base, Upside, Downside, and Custom Cases
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Preset Cases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ForecastCard forecast={baseCase} />
          <ForecastCard forecast={upsideCase} />
          <ForecastCard forecast={downsideCase} />
        </div>

        {/* Custom Case */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Custom Inputs */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Assumptions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Growth Rate (annual)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customAssumptions.rentGrowthRate}
                  onChange={(e) =>
                    setCustomAssumptions({
                      ...customAssumptions,
                      rentGrowthRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Current: {formatPercent(customAssumptions.rentGrowthRate)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vacancy Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customAssumptions.vacancyRate}
                  onChange={(e) =>
                    setCustomAssumptions({
                      ...customAssumptions,
                      vacancyRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Current: {formatPercent(customAssumptions.vacancyRate)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Growth Rate (annual)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customAssumptions.expenseGrowthRate}
                  onChange={(e) =>
                    setCustomAssumptions({
                      ...customAssumptions,
                      expenseGrowthRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Current: {formatPercent(customAssumptions.expenseGrowthRate)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exit Cap Rate
                </label>
                <input
                  type="number"
                  step="0.005"
                  value={customAssumptions.exitCapRate}
                  onChange={(e) =>
                    setCustomAssumptions({
                      ...customAssumptions,
                      exitCapRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Current: {formatPercent(customAssumptions.exitCapRate)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hold Period (years)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="15"
                  value={customAssumptions.holdPeriodYears}
                  onChange={(e) =>
                    setCustomAssumptions({
                      ...customAssumptions,
                      holdPeriodYears: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Current: {customAssumptions.holdPeriodYears} years
                </span>
              </div>
            </div>
          </div>

          {/* Custom Results */}
          <ForecastCard forecast={customCase} />
        </div>
      </div>
    </div>
  );
}
