import React, { useEffect, useState } from 'react';
import { impactApi } from '../../api/impactApi';
import ImpactBadge from '../../components/ImpactBadge';
import Loader from '../../components/Loader';

export default function BuyerImpact() {
  const [impact, setImpact] = useState(null);
  const [table, setTable] = useState(null);

  useEffect(() => {
    Promise.all([impactApi.buyerSummary(), impactApi.categories()]).then(([iRes, tRes]) => {
      setImpact(iRes.data.data);
      setTable(tRes.data.data);
    });
  }, []);

  if (!impact) return <Loader />;

  return (
    <div className="space-y-6">
      <ImpactBadge waterSavedLiters={impact.totalWaterSavedLiters} co2SavedKg={impact.totalCo2SavedKg} />
      <p className="text-sm text-forest-500">Based on {impact.totalOrders} completed order(s).</p>

      <div>
        <h2 className="mb-2 text-sm font-medium text-forest-800">How we estimate impact</h2>
        <p className="mb-3 text-sm text-forest-500">
          Every category has a predefined average water & CO₂ saving vs. buying new — kept simple and explainable.
        </p>
        <div className="card divide-y divide-forest-50">
          {Object.entries(table || {}).map(([cat, val]) => (
            <div key={cat} className="flex justify-between p-3 text-sm">
              <span className="capitalize text-forest-700">{cat}</span>
              <span className="text-forest-500">{val.waterSavedLiters}L · {val.co2SavedKg}kg CO₂</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
