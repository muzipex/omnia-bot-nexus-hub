
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { USDT_ADDRESS } from "@/lib/crypto-payment";

interface CryptoPaymentDialogProps {
  showCryptoDialog: boolean;
  setShowCryptoDialog: (show: boolean) => void;
  currentPlan: { price: number } | null;
  handleCopyAddress: () => void;
  submitting: boolean;
  handleSubmitTransaction: () => void;
}

const CryptoPaymentDialog: React.FC<CryptoPaymentDialogProps> = ({
  showCryptoDialog,
  setShowCryptoDialog,
  currentPlan,
  handleCopyAddress,
  submitting,
  handleSubmitTransaction
}) => {
  return (
    <Dialog open={showCryptoDialog} onOpenChange={setShowCryptoDialog}>
      <DialogContent className="bg-tech-dark border-tech-blue/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Pay with USDT (Tether)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-gray-300">Send <span className="text-tech-green font-bold">
              ${currentPlan?.price} USDT
            </span> to the following address:</p>
          </div>
          
          <div className="bg-tech-charcoal p-4 rounded-lg border border-tech-blue/30">
            <div className="flex items-center space-x-2">
              <div className="break-all text-sm text-gray-300 font-mono">
                {USDT_ADDRESS}
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyAddress} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-tech-blue/10 p-4 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="text-tech-blue font-bold">Important:</span> Please send only USDT on the Binance Smart Chain (BEP20) network. After sending, click the button below to submit your transaction for manual verification by an admin.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSubmitTransaction} 
            className="w-full bg-tech-green text-tech-dark font-bold"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "I've Sent the Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;
