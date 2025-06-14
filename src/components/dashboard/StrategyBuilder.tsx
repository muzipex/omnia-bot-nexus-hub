
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Save } from 'lucide-react';

const strategySchema = z.object({
  name: z.string().min(3, { message: 'Strategy name must be at least 3 characters.' }),
  symbol: z.string({ required_error: 'Please select a symbol.' }),
  timeframe: z.string({ required_error: 'Please select a timeframe.' }),
  lotSize: z.coerce.number().positive(),
  stopLoss: z.coerce.number().int().positive(),
  takeProfit: z.coerce.number().int().positive(),
  indicators: z.object({
    rsi: z.boolean().default(false),
    ma: z.boolean().default(false),
    bollinger: z.boolean().default(false),
  }),
  entryCondition: z.string().min(10, { message: 'Entry condition is too short.' }),
  exitCondition: z.string().min(10, { message: 'Exit condition is too short.' }),
});

const StrategyBuilder = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof strategySchema>>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: '',
      lotSize: 0.01,
      stopLoss: 20,
      takeProfit: 40,
      indicators: { rsi: false, ma: false, bollinger: false },
      entryCondition: '',
      exitCondition: '',
    },
  });

  function onSubmit(values: z.infer<typeof strategySchema>) {
    console.log('Strategy saved:', values);
    toast({
      title: 'Strategy Saved!',
      description: `Your new strategy "${values.name}" has been saved.`,
      variant: 'default',
    });
    form.reset();
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-cyan-400" />
          Create Your Custom AI Strategy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My Golden Cross Strategy" {...field} className="bg-gray-800 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="Select a symbol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 text-white border-gray-600">
                            <SelectItem value="EURUSD">EUR/USD</SelectItem>
                            <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                            <SelectItem value="USDJPY">USD/JPY</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeframe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="Select a timeframe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 text-white border-gray-600">
                            <SelectItem value="M15">15 Minutes</SelectItem>
                            <SelectItem value="H1">1 Hour</SelectItem>
                            <SelectItem value="H4">4 Hours</SelectItem>
                            <SelectItem value="D1">1 Day</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="lotSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lot Size</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} className="bg-gray-800 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stopLoss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stop Loss (pips)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-gray-800 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="takeProfit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Take Profit (pips)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-gray-800 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Technical Indicators</FormLabel>
                  <FormDescription className="text-gray-400">Select indicators to use in your strategy.</FormDescription>
                  <div className="flex items-center space-x-4 pt-2">
                    <FormField
                      control={form.control}
                      name="indicators.rsi"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="rsi" />
                          </FormControl>
                          <FormLabel htmlFor="rsi" className="font-normal">RSI</FormLabel>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="indicators.ma"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="ma" />
                          </FormControl>
                          <FormLabel htmlFor="ma" className="font-normal">Moving Average</FormLabel>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="indicators.bollinger"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id="bollinger" />
                          </FormControl>
                          <FormLabel htmlFor="bollinger" className="font-normal">Bollinger Bands</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </FormItem>
                
                <FormDescription className="text-gray-400">
                    (Note: For now, conditions are descriptive. Logic implementation is next.)
                </FormDescription>

                <FormField
                  control={form.control}
                  name="entryCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Condition</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., RSI > 70 and MA(20) crosses MA(50)" {...field} className="bg-gray-800 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="exitCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Condition</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., RSI < 30 or price hits SL/TP" {...field} className="bg-gray-800 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Strategy
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StrategyBuilder;
