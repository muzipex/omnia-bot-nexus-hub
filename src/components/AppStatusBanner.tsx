
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Activity } from 'lucide-react';

const AppStatusBanner = () => {
  return (
    <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-y border-green-500/30 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">System Operational</span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-blue-400">Live Trading Active</span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <Badge className="bg-purple-600 text-white border-0">
            v2.0 Production Ready
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default AppStatusBanner;
