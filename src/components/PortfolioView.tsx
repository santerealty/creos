'use client';

import { useState } from 'react';
import { Property } from '@/types';
import { useRouter } from 'next/navigation';
import { useSimulationStore } from '@/store/simulationStore';
import { createParkviewSimulation } from '@/data/parkview';

interface PropertyCardProps {
  property: Property;
  onStart: () => void;
}

function PropertyCard({ property, onStart }: PropertyCardProps) {
  // Calculate entry cap rate
  const entryNoi = property.annualGrossPotentialRent + property.annualOtherIncome 
    - property.annualVacancy - property.annualConcessions - property.annualBadDebt 
    - property.annualOperatingExpenses;
  const entryCapRate = (entryNoi / property.purchasePrice * 100).toFixed(2);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
          <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {property.strategy}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Units</div>
          <div className="text-lg font-semibold text-gray-900">{property.units}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Purchase Price</div>
          <div className="text-lg font-semibold text-gray-900">
            ${(property.purchasePrice / 1_000_000).toFixed(1)}M
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Occupancy</div>
          <div className="text-lg font-semibold text-gray-900">
            {(property.currentOccupancy * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Entry Cap</div>
          <div className="text-lg font-semibold text-gray-900">{entryCapRate}%</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Rent Upside</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">${property.avgRentPerUnit}/mo</span>
          <span className="text-gray-400">→</span>
          <span className="text-sm font-semibold text-emerald-600">${property.marketRentPerUnit}/mo</span>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            +{(((property.marketRentPerUnit - property.avgRentPerUnit) / property.avgRentPerUnit) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
      >
        Start Simulation
      </button>
    </div>
  );
}

export default function PortfolioView() {
  const [guestName, setGuestName] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const router = useRouter();
  const { startSimulation } = useSimulationStore();

  const handleGuestEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      setHasEntered(true);
    }
  };

  const handleStartSimulation = () => {
    const simulation = createParkviewSimulation();
    startSimulation(simulation);
    router.push('/simulation');
  };

  // Guest Entry Screen
  if (!hasEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CREOS</h1>
            <p className="text-gray-600">AI-Native Commercial Real Estate Investment Simulation</p>
          </div>

          <form onSubmit={handleGuestEntry} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name to begin
              </label>
              <input
                type="text"
                id="name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Enter Portfolio
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              All data in this simulation is SYNTHETIC. No LLM API keys required.
              This is a demonstration of AI-native CRE workflow orchestration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Portfolio Command Center
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {guestName}
          </h1>
          <p className="text-gray-600">
            Select a property to begin your investment simulation
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Featured: Parkview Terrace */}
          <PropertyCard
            property={createParkviewSimulation().property}
            onStart={handleStartSimulation}
          />

          {/* Placeholder properties */}
          {[
            { name: 'Meridian Office Plaza', city: 'Austin', state: 'TX', strategy: 'Core+', units: 0, type: 'Office' },
            { name: 'Westgate Retail Center', city: 'Denver', state: 'CO', strategy: 'Value-Add', units: 0, type: 'Retail' },
            { name: 'Innovation Logistics Hub', city: 'Dallas', state: 'TX', strategy: 'Opportunistic', units: 0, type: 'Industrial' },
          ].map((prop, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 opacity-60">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{prop.name}</h3>
                <p className="text-sm text-gray-600">{prop.city}, {prop.state}</p>
              </div>
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-gray-500">Coming Soon</span>
              </div>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 font-medium py-3 rounded-lg cursor-not-allowed"
              >
                Not Available
              </button>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">About CREOS</h3>
          <p className="text-blue-800 text-sm">
            CREOS simulates the complete lifecycle of a commercial real estate investment — from data review 
            through underwriting, due diligence, financing, operations, disposition, and final distribution. 
            All financial calculations use a deterministic engine (no LLMs for math). Agent communications are 
            scripted to demonstrate AI-native workflow orchestration.
          </p>
        </div>
      </div>
    </div>
  );
}
