
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Simple multi-account display based on accounts prop.
const MultiAccountCard = ({ accounts }: { accounts: any[] }) => (
  <Card className="bg-tech-charcoal border-tech-blue/30">
    <CardHeader>
      <CardTitle className="text-white">Managed Accounts</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-gray-300 text-sm space-y-1">
        {accounts.map((acc) => (
          <li key={acc.account_number}>
            {acc.server} #{acc.account_number} — {acc.currency} — Balance: ${acc.balance}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
export default MultiAccountCard;
