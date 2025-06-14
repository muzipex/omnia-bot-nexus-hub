
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// This would display admin actions if saved in Supabase (stub with mock actions now)
const mockActions = [
  { id: 1, action: "User ban", who: "admin@site.com", when: "2025-06-14 11:20" },
  { id: 2, action: "Manual trade close", who: "admin@site.com", when: "2025-06-14 11:10" },
  { id: 3, action: "Changed settings", who: "admin@site.com", when: "2025-06-14 10:49" }
];

const AdminAuditLogCard = () => (
  <Card className="bg-tech-charcoal border-tech-blue/30">
    <CardHeader>
      <CardTitle className="text-white">Admin Audit Log</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-gray-300 text-sm space-y-1">
        {mockActions.map((a) => (
          <li key={a.id}>
            <span className="font-bold">{a.action}:</span> {a.who} <span className="text-xs text-gray-400">({a.when})</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
export default AdminAuditLogCard;
