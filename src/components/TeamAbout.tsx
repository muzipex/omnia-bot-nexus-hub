import React from 'react';
import { Users, MapPin, Calendar, ExternalLink } from 'lucide-react';

const TeamAbout: React.FC = () => {
  const team = [
    {
      name: "Dr. Marcus Chen",
      position: "Chief Technology Officer",
      background: "Former Goldman Sachs quantitative analyst with 15+ years in algorithmic trading",
      credentials: "PhD in Financial Engineering, MIT"
    },
    {
      name: "Sarah Williams",
      position: "Head of Risk Management",
      background: "Ex-Morgan Stanley risk specialist, expert in forex market dynamics",
      credentials: "CFA, FRM certified"
    },
    {
      name: "James Rodriguez",
      position: "Lead AI Engineer",
      background: "Former Google AI researcher specializing in financial machine learning",
      credentials: "MS Computer Science, Stanford"
    }
  ];

  const company = {
    founded: "2021",
    headquarters: "London, UK",
    employees: "25+ Financial Professionals",
    licenses: "FCA Authorized, EU Passported"
  };

  return (
    <div className="bg-tech-dark py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="glow-text">Meet Our</span> <span className="blue-glow-text">Expert Team</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Led by industry veterans with decades of combined experience in quantitative finance and AI development.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Leadership Team</h3>
            <div className="space-y-6">
              {team.map((member, index) => (
                <div key={index} className="tech-card">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tech-blue to-tech-purple flex items-center justify-center text-white text-xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{member.name}</h4>
                      <p className="text-tech-blue font-medium">{member.position}</p>
                      <p className="text-gray-400 text-sm mt-2">{member.background}</p>
                      <p className="text-tech-green text-xs mt-1">{member.credentials}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Company Information</h3>
            <div className="tech-card space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-tech-blue" />
                  <div>
                    <p className="text-gray-400 text-sm">Founded</p>
                    <p className="text-white font-medium">{company.founded}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-tech-blue" />
                  <div>
                    <p className="text-gray-400 text-sm">Headquarters</p>
                    <p className="text-white font-medium">{company.headquarters}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-tech-blue" />
                  <div>
                    <p className="text-gray-400 text-sm">Team Size</p>
                    <p className="text-white font-medium">{company.employees}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-tech-blue" />
                  <div>
                    <p className="text-gray-400 text-sm">Regulatory Status</p>
                    <p className="text-white font-medium">{company.licenses}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-tech-blue/20 pt-6">
                <h4 className="text-lg font-bold text-white mb-3">Our Mission</h4>
                <p className="text-gray-300 leading-relaxed">
                  To democratize access to institutional-grade trading technology by providing retail investors 
                  with the same algorithmic advantages used by major investment banks and hedge funds.
                </p>
              </div>

              <div className="border-t border-tech-blue/20 pt-6">
                <h4 className="text-lg font-bold text-white mb-3">Investment Philosophy</h4>
                <p className="text-gray-300 leading-relaxed">
                  We believe in transparent, risk-controlled automated trading that preserves capital while 
                  capturing consistent market opportunities through advanced quantitative analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="tech-card bg-gradient-to-r from-tech-blue/5 to-tech-green/5 border-tech-blue/30">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">Investor Relations</h3>
            <p className="text-gray-300 mb-6">
              For institutional partnerships, investment opportunities, or regulatory inquiries, 
              please contact our investor relations team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-tech-blue">
                <span className="font-medium">Email:</span> investors@omniabot.com
              </div>
              <div className="text-tech-blue">
                <span className="font-medium">Phone:</span> +44 20 7946 0958
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent"></div>
    </div>
  );
};

export default TeamAbout;