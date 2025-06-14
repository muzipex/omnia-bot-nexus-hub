import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TradeJournalEntry {
  id: string;
  ticket: number;
  note: string;
}

const TradeJournalCard = ({ positions }: { positions: any[] }) => {
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleNoteChange = (ticket: number, note: string) => {
    setNotes((prev) => ({ ...prev, [ticket]: note }));
  };

  const handleSaveNote = (ticket: number) => {
    // This demo just keeps notes in local state. Can be saved to Supabase if desired.
    alert("Note saved for trade #" + ticket + ": " + notes[ticket]);
  };

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader>
        <CardTitle className="text-white">Trade Journal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.length === 0 ? (
            <div className="text-gray-400 text-sm">No open trades to journal yet.</div>
          ) : (
            positions.map((pos) => (
              <div key={pos.ticket} className="border-b border-gray-700 pb-3 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-tech-green">#{pos.ticket} {pos.symbol}</div>
                    <div className="text-xs text-gray-400">Type: {pos.trade_type}, Volume: {pos.volume}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      className="bg-gray-900 border-gray-700 text-xs w-48"
                      value={notes[pos.ticket] || ""}
                      onChange={(e) => handleNoteChange(pos.ticket, e.target.value)}
                      placeholder="Add note..."
                    />
                    <Button size="sm" variant="outline" onClick={() => handleSaveNote(pos.ticket)}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default TradeJournalCard;
