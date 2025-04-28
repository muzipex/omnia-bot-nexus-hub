
import React from 'react';
import { CircuitBoard, Brain, Database, Bolt, Signal, Zap } from 'lucide-react';

const features = [
  {
    icon: <CircuitBoard className="w-6 h-6" />,
    title: 'Advanced Algorithms',
    description: 'Proprietary trading algorithms based on deep market analysis and machine learning patterns.'
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Adaptive AI',
    description: 'Self-learning system that adapts to changing market conditions and improves over time.'
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Data-Driven',
    description: 'Processes millions of data points per second to identify optimal trading opportunities.'
  },
  {
    icon: <Bolt className="w-6 h-6" />,
    title: 'Lightning Fast',
    description: 'Execute trades in milliseconds to capitalize on market movements before others can react.'
  },
  {
    icon: <Signal className="w-6 h-6" />,
    title: 'Risk Management',
    description: 'Built-in risk parameters to protect your capital through automated stop-loss mechanisms.'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Automated 24/7',
    description: 'Trade around the clock without manual intervention, never missing a profitable opportunity.'
  }
];

const Features: React.FC = () => {
  return (
    <div id="features" className="grid-bg noise-effect py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="blue-glow-text">Next-Gen</span> Trading <span className="glow-text">Technology</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Omnia BOT combines cutting-edge technologies to deliver consistent results in any market condition.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="tech-card hover:border-tech-blue/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="mb-4 text-tech-blue group-hover:text-tech-green transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent"></div>
    </div>
  );
};

export default Features;
