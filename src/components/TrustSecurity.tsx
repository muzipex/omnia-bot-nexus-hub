import React from 'react';
import { Shield, Lock, FileCheck, Award, Eye, TrendingUp } from 'lucide-react';

const TrustSecurity: React.FC = () => {
  const certifications = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "ISO 27001 Certified",
      description: "International standard for information security management systems"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "256-bit SSL encryption and multi-layered security protocols"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Regulatory Compliance",
      description: "Compliant with ESMA, FCA, and CySEC trading regulations"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Verified Performance",
      description: "Third-party audited results by independent financial analysts"
    }
  ];

  const stats = [
    {
      icon: <Eye className="w-6 h-6" />,
      value: "$2.4M+",
      label: "Assets Under Management"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      value: "18 Months",
      label: "Live Track Record"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      value: "99.9%",
      label: "Uptime Guarantee"
    }
  ];

  return (
    <div className="bg-tech-charcoal py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Trust &</span> <span className="blue-glow-text">Security</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Institutional-grade security and regulatory compliance to protect your investments and ensure transparent operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {certifications.map((cert, index) => (
            <div 
              key={index}
              className="tech-card text-center group hover:border-tech-blue/40 transition-all duration-300"
            >
              <div className="mb-4 text-tech-blue group-hover:text-tech-green transition-colors duration-300 flex justify-center">
                {cert.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{cert.title}</h3>
              <p className="text-gray-400 text-sm">{cert.description}</p>
            </div>
          ))}
        </div>

        <div className="tech-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-tech-blue/10 text-tech-blue">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold glow-text mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 tech-card">
          <h3 className="text-xl font-bold text-white mb-4">Regulatory Disclaimer</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Trading in foreign exchange carries a high level of risk and may not be suitable for all investors. 
            Past performance is not indicative of future results. Before deciding to trade, you should carefully 
            consider your investment objectives, level of experience, and risk appetite. Omnia BOT is registered 
            with relevant financial authorities and operates under strict regulatory oversight to ensure investor protection.
          </p>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent"></div>
    </div>
  );
};

export default TrustSecurity;