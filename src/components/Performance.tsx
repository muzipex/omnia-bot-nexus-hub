
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, TrendingUp, Rocket } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { month: 'Jan', profit: 210 },
  { month: 'Feb', profit: 280 },
  { month: 'Mar', profit: 240 },
  { month: 'Apr', profit: 320 },
  { month: 'May', profit: 350 },
  { month: 'Jun', profit: 410 },
  { month: 'Jul', profit: 450 },
  { month: 'Aug', profit: 490 },
  { month: 'Sep', profit: 520 },
  { month: 'Oct', profit: 570 },
  { month: 'Nov', profit: 600 },
  { month: 'Dec', profit: 650 },
];

const stats = [
  { label: 'Win Rate', value: '87%', icon: <ArrowUp className="w-4 h-4" /> },
  { label: 'Avg. Monthly Return', value: '12%', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Max Drawdown', value: '5.2%', icon: <Rocket className="w-4 h-4" /> },
];

const Performance: React.FC = () => {
  return (
    <div id="performance" className="bg-tech-dark py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="purple-glow-text">Performance</span> That <span className="glow-text">Speaks</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Our algorithms have been rigorously tested and optimized for maximum profitability.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="tech-card relative overflow-hidden h-[400px]">
              <div className="absolute top-4 left-4">
                <h3 className="text-xl font-bold text-white">Annual Profit Growth</h3>
                <p className="text-gray-400 text-sm">Performance over 12 months</p>
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 60, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF41" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00FF41" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1F2C', 
                      border: '1px solid #1EAEDB',
                      borderRadius: '0.375rem',
                      boxShadow: '0 0 10px rgba(30, 174, 219, 0.3)'
                    }}
                    itemStyle={{ color: '#00FF41' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#00FF41" 
                    strokeWidth={3}
                    dot={{ stroke: '#00FF41', strokeWidth: 2, r: 4, fill: '#1A1F2C' }}
                    activeDot={{ r: 6, stroke: '#00FF41', strokeWidth: 2, fill: '#1A1F2C' }}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-tech-charcoal border-tech-blue/20">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="mb-2 w-8 h-8 rounded-full bg-tech-blue/10 flex items-center justify-center text-tech-blue">
                      {stat.icon}
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-xl font-bold glow-text">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-tech-purple to-tech-blue rounded-xl blur opacity-30"></div>
              <div className="relative tech-card overflow-hidden">
                <img 
                  src="/placeholder.svg"
                  alt="Omnia Bot Trading Results" 
                  className="w-full rounded-lg"
                />
              </div>
            </div>
            
            <div className="tech-card space-y-4">
              <h3 className="text-xl font-bold text-white">Proven Track Record</h3>
              <p className="text-gray-300">
                Omnia BOT has consistently outperformed the market by leveraging advanced pattern recognition and predictive analytics.
              </p>
              <ul className="space-y-3">
                {[
                  'Trades multiple currency pairs simultaneously',
                  'Adapts to volatile market conditions',
                  'Backtested against 10+ years of historical data',
                  'Optimized risk-to-reward ratios for maximum profitability'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-1 min-w-4 h-4 rounded-full bg-tech-green/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-tech-green"></div>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
