import React from 'react';

export default function ImpactBadge({ waterSavedLiters, co2SavedKg, compact }) {
  if (compact) {
    return (
      <span className="badge bg-forest-100 text-forest-700">
        💧 {waterSavedLiters}L · 🌱 {co2SavedKg}kg CO₂ saved
      </span>
    );
  }
  return (
    <div className="card flex gap-4 p-4">
      <div className="flex-1 text-center">
        <p className="text-2xl font-semibold text-forest-800">{waterSavedLiters?.toLocaleString()}L</p>
        <p className="text-xs text-forest-500">Water saved</p>
      </div>
      <div className="w-px bg-forest-100" />
      <div className="flex-1 text-center">
        <p className="text-2xl font-semibold text-forest-800">{co2SavedKg?.toLocaleString()}kg</p>
        <p className="text-xs text-forest-500">CO₂ avoided</p>
      </div>
    </div>
  );
}
