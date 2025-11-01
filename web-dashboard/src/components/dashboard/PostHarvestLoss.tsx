
import React from 'react';

interface LossData {
  crop: string;
  lossPercentage: number;
  targetReduction: number;
  trend: 'up' | 'down' | 'stable';
  regionBreakdown: { [region: string]: number };
  storageLoss: number;
  transportLoss: number;
}

const PostHarvestLoss: React.FC = () => {
  // Placeholder data for post-harvest losses
  const lossData: LossData[] = [
    {
      crop: 'Maize',
      lossPercentage: 15.2,
      targetReduction: 25,
      trend: 'down',
      regionBreakdown: { 'Oromia': 12.5, 'Amhara': 18.3, 'SNNPR': 14.1 },
      storageLoss: 8.5,
      transportLoss: 6.7
    },
    {
      crop: 'Wheat',
      lossPercentage: 12.8,
      targetReduction: 20,
      trend: 'stable',
      regionBreakdown: { 'Tigray': 10.2, 'Amhara': 15.6, 'Oromia': 11.4 },
      storageLoss: 7.2,
      transportLoss: 5.6
    },
    {
      crop: 'Teff',
      lossPercentage: 18.5,
      targetReduction: 30,
      trend: 'up',
      regionBreakdown: { 'Amhara': 22.1, 'Oromia': 16.8, 'Addis Ababa': 12.3 },
      storageLoss: 10.8,
      transportLoss: 7.7
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const progress = (target - current) / target * 100;
    if (progress >= 50) return 'safe';
    if (progress >= 25) return 'warning';
    return 'critical';
  };

  return (
    <div className="bg-card p-4 shadow-md rounded-md border">
      <h2 className="font-bold text-lg mb-4">Post-Harvest Loss Overview</h2>

      {lossData.map((data, index) => (
        <div key={index} className="mb-4 p-3 bg-white rounded-md shadow-sm border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{data.crop}</h3>
            <span className="text-lg">{getTrendIcon(data.trend)}</span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Loss: {data.lossPercentage}%</span>
              <span>Target: {data.targetReduction}% reduction</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${getProgressColor(data.lossPercentage, data.targetReduction)}`}
                style={{ width: `${Math.min((data.targetReduction - data.lossPercentage) / data.targetReduction * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-xs text-gray-600 mb-2">
            <div>Storage Loss: {data.storageLoss}% | Transport Loss: {data.transportLoss}%</div>
          </div>

          <div className="text-xs">
            <strong>Regional Breakdown:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(data.regionBreakdown).map(([region, loss]) => (
                <span key={region} className="bg-gray-100 px-2 py-1 rounded">
                  {region}: {loss}%
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-semibold text-sm mb-2">Trends Over Time</h3>
        <div className="text-xs text-gray-600">
          <p>Overall loss reduction: 8.5% improvement in last quarter</p>
          <p>Storage improvements: 12% reduction through better facilities</p>
          <p>Transport optimization: 15% reduction via route planning</p>
        </div>
      </div>
    </div>
  );
};

export default PostHarvestLoss;
