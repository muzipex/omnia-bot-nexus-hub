import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Clock } from 'lucide-react';
import { getVisits } from '@/hooks/use-visitor-tracking';
import { PageVisit } from '@/types/admin';

export const VisitorStats: React.FC = () => {
  const [visits, setVisits] = useState<PageVisit[]>([]);

  useEffect(() => {
    // Initial load
    setVisits(getVisits());

    // Update every minute
    const interval = setInterval(() => {
      setVisits(getVisits());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const todayVisits = visits.filter(visit => {
    const visitDate = new Date(visit.timestamp);
    const today = new Date();
    return visitDate.toDateString() === today.toDateString();
  });

  const last24Hours = visits.filter(visit => {
    const visitDate = new Date(visit.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - visitDate.getTime();
    return timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  });

  const uniquePaths = [...new Set(visits.map(visit => visit.path))];
  const topPages = uniquePaths
    .map(path => ({
      path,
      count: visits.filter(v => v.path === path).length,
      lastVisit: new Date(Math.max(...visits.filter(v => v.path === path).map(v => new Date(v.timestamp).getTime())))
    }))
    .sort((a, b) => b.count - a.count);

  const topReferrers = [...new Set(visits.filter(v => v.referrer).map(v => new URL(v.referrer!).hostname))]
    .map(domain => ({
      domain,
      count: visits.filter(v => v.referrer && new URL(v.referrer).hostname === domain).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-tech-dark border-tech-blue/20">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-tech-blue" />
            <h3 className="text-lg font-semibold text-white">Today's Visitors</h3>
          </div>
          <p className="text-3xl font-bold text-tech-blue mt-2">{todayVisits.length}</p>
        </Card>

        <Card className="p-4 bg-tech-dark border-tech-blue/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-tech-green" />
            <h3 className="text-lg font-semibold text-white">Last 24 Hours</h3>
          </div>
          <p className="text-3xl font-bold text-tech-green mt-2">{last24Hours.length}</p>
        </Card>

        <Card className="p-4 bg-tech-dark border-tech-blue/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-tech-purple" />
            <h3 className="text-lg font-semibold text-white">Total Pages</h3>
          </div>
          <p className="text-3xl font-bold text-tech-purple mt-2">{uniquePaths.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Top Pages</h3>
          <div className="rounded-md border border-tech-blue/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.slice(0, 5).map(({ path, count, lastVisit }) => (
                  <TableRow key={path}>
                    <TableCell>{path || '/'}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>{lastVisit.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Top Referrers</h3>
          <div className="rounded-md border border-tech-blue/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReferrers.map(({ domain, count }) => (
                  <TableRow key={domain}>
                    <TableCell>{domain}</TableCell>
                    <TableCell>{count}</TableCell>
                  </TableRow>
                ))}
                {topReferrers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      No referrers yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Visits</h3>
        <div className="rounded-md border border-tech-blue/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Device Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.slice(-10).reverse().map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{new Date(visit.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{visit.path || '/'}</TableCell>
                  <TableCell>{visit.referrer ? new URL(visit.referrer).hostname : 'Direct'}</TableCell>
                  <TableCell className="truncate max-w-xs">{visit.userAgent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};