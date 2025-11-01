import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SupplyDemandGap {
  crop: string;
  predictedGap: number; // positive = surplus, negative = deficit
  region: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface HighRiskItem {
  type: 'crop' | 'region';
  name: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  predictedImpact: string;
}

interface SuggestedAction {
  type: 'Buffer Release' | 'Transport Incentive' | 'Price Adjustment';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedCrops: string[];
  affectedRegions: string[];
}

const Analytics: React.FC = () => {
  const [supplyDemandData, setSupplyDemandData] = useState<SupplyDemandGap[]>([]);
  const [highRiskItems, setHighRiskItems] = useState<HighRiskItem[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Supply-Demand Gaps
    const gaps: SupplyDemandGap[] = [
      { crop: 'Maize', predictedGap: -15000, region: 'Oromia', severity: 'Critical' },
      { crop: 'Wheat', predictedGap: -8000, region: 'Amhara', severity: 'High' },
      { crop: 'Teff', predictedGap: 5000, region: 'Tigray', severity: 'Medium' },
      { crop: 'Sorghum', predictedGap: -3000, region: 'SNNPR', severity: 'Medium' },
      { crop: 'Barley', predictedGap: 2000, region: 'Afar', severity: 'Low' },
    ];
    setSupplyDemandData(gaps);

    // High-Risk Crops/Regions
    const risks: HighRiskItem[] = [
      { type: 'crop', name: 'Maize', riskLevel: 'Critical', reason: 'Drought conditions in major growing areas', predictedImpact: '15% yield reduction expected' },
      { type: 'region', name: 'Somali', riskLevel: 'High', reason: 'Security concerns affecting transport', predictedImpact: 'Delayed deliveries, potential spoilage' },
      { type: 'crop', name: 'Coffee', riskLevel: 'High', reason: 'Pest outbreak in Sidama region', predictedImpact: '20% quality degradation' },
      { type: 'region', name: 'Gambella', riskLevel: 'Medium', reason: 'Flooding risks during rainy season', predictedImpact: 'Infrastructure damage possible' },
    ];
    setHighRiskItems(risks);

    // Suggested Actions
    const actions: SuggestedAction[] = [
      {
        type: 'Buffer Release',
        description: 'Release 10,000 MT of maize from strategic reserves in Addis Ababa',
        priority: 'Critical',
        affectedCrops: ['Maize'],
        affectedRegions: ['Oromia', 'Addis Ababa']
      },
      {
        type: 'Transport Incentive',
        description: 'Offer 15% subsidy for truckers on Addis Ababa → Somali route',
        priority: 'High',
        affectedCrops: ['Maize', 'Wheat'],
        affectedRegions: ['Somali', 'Addis Ababa']
      },
      {
        type: 'Price Adjustment',
        description: 'Implement price ceiling on wheat in Amhara region markets',
        priority: 'High',
        affectedCrops: ['Wheat'],
        affectedRegions: ['Amhara']
      },
      {
        type: 'Buffer Release',
        description: 'Release 5,000 MT of sorghum from Hawassa reserves',
        priority: 'Medium',
        affectedCrops: ['Sorghum'],
        affectedRegions: ['SNNPR', 'Hawassa']
      },
    ];
    setSuggestedActions(actions);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#D32F2F';
      case 'High': return '#F57C00';
      case 'Medium': return '#FBC02D';
      case 'Low': return '#388E3C';
      default: return '#666';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'Buffer Release': return '📦';
      case 'Transport Incentive': return '🚚';
      case 'Price Adjustment': return '💰';
      default: return '⚠️';
    }
  };

  // Prepare data for charts
  const gapChartData = supplyDemandData.map(gap => ({
    crop: gap.crop,
    gap: gap.predictedGap,
    region: gap.region
  }));

  const riskDistribution = highRiskItems.reduce((acc, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskChartData = Object.entries(riskDistribution).map(([level, count]) => ({
    level,
    count,
    color: getSeverityColor(level)
  }));

  const COLORS = ['#D32F2F', '#F57C00', '#FBC02D', '#388E3C'];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Analytics & Forecasting Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Supply-Demand Gaps Chart */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h2>Predicted Supply-Demand Gaps (MT)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gapChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value} MT`, 'Gap']} />
              <Legend />
              <Bar dataKey="gap" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h2>Risk Level Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
              label={({ level, count }: { level: string; count: number }) => `${level}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {riskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Risk Crops/Regions */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Early Warning: High-Risk Crops & Regions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          {highRiskItems.map((item, index) => (
            <div
              key={index}
              style={{
                border: `2px solid ${getSeverityColor(item.riskLevel)}`,
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '1.5em',
                  marginRight: '10px',
                  color: getSeverityColor(item.riskLevel)
                }}>
                  {item.type === 'crop' ? '🌾' : '📍'}
                </span>
                <h3 style={{ margin: 0, color: getSeverityColor(item.riskLevel) }}>
                  {item.name} ({item.riskLevel} Risk)
                </h3>
              </div>
              <p><strong>Reason:</strong> {item.reason}</p>
              <p><strong>Predicted Impact:</strong> {item.predictedImpact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Actions */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>Suggested Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '15px' }}>
          {suggestedActions.map((action, index) => (
            <div
              key={index}
              style={{
                border: `2px solid ${getSeverityColor(action.priority)}`,
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5em', marginRight: '10px' }}>
                  {getActionIcon(action.type)}
                </span>
                <h3 style={{ margin: 0, color: getSeverityColor(action.priority) }}>
                  {action.type} ({action.priority} Priority)
                </h3>
              </div>
              <p>{action.description}</p>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                <p><strong>Affected Crops:</strong> {action.affectedCrops.join(', ')}</p>
                <p><strong>Affected Regions:</strong> {action.affectedRegions.join(', ')}</p>
              </div>
              <button
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: getSeverityColor(action.priority),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Implement Action
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
