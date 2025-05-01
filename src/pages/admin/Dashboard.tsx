import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentVerification } from '@/components/admin/PaymentVerification';
import { VisitorStats } from '@/components/admin/VisitorStats';
import { LogOut } from 'lucide-react';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin');
  };

  return (
    <>
      <SEO 
        title="Admin Dashboard"
        description="Omnia BOT Admin Dashboard"
        noindex={true}
      />

      <div className="min-h-screen bg-tech-dark p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4">
            <Breadcrumbs />
            
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-tech-blue hover:text-tech-blue/80"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs defaultValue="payments" className="w-full mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="payments">Payment Verification</TabsTrigger>
              <TabsTrigger value="visitors">Visitor Stats</TabsTrigger>
            </TabsList>
            <TabsContent value="payments">
              <Card className="bg-tech-dark border-tech-blue/20 p-4">
                <PaymentVerification />
              </Card>
            </TabsContent>
            <TabsContent value="visitors">
              <Card className="bg-tech-dark border-tech-blue/20 p-4">
                <VisitorStats />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;