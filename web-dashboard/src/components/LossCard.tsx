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

const LossCard: React.FC = () => {
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
    if (progress >= 50) return '#4CAF50'; // Green
    if (progress >= 25) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '15px',
      margin: '10px',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Post-Harvest Loss Overview</h3>

      {lossData.map((data, index) => (
        <div key={index} style={{
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>{data.crop}</h4>
            <span style={{ fontSize: '1.2em' }}>{getTrendIcon(data.trend)}</span>
          </div>

          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Loss: {data.lossPercentage}%</span>
              <span>Target: {data.targetReduction}% reduction</span>
            </div>

            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((data.targetReduction - data.lossPercentage) / data.targetReduction * 100, 100)}%`,
                height: '100%',
                backgroundColor: getProgressColor(data.lossPercentage, data.targetReduction)
              }}></div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
              <div>Storage Loss: {data.storageLoss}% | Transport Loss: {data.transportLoss}%</div>
              <div style={{ marginTop: '5px' }}>
                <strong>Regional Breakdown:</strong>
                {Object.entries(data.regionBreakdown).map(([region, loss]) => (
                  <span key={region} style={{ marginRight: '10px' }}>
                    {region}: {loss}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Trends Over Time</h4>
        <div style={{ fontSize: '0.9em' }}>
          <p>Overall loss reduction: 8.5% improvement in last quarter</p>
          <p>Storage improvements: 12% reduction through better facilities</p>
          <p>Transport optimization: 15% reduction via route planning</p>
        </div>
      </div>
    </div>
  );
};

export default LossCard;
