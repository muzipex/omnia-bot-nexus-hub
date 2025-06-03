
import React from 'react';
import { useTheme } from '@/hooks/use-theme-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Card className="tech-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((themeOption) => (
            <Button
              key={themeOption.id}
              variant={theme === themeOption.id ? "default" : "outline"}
              className={`p-4 h-auto flex flex-col items-start text-left relative ${
                theme === themeOption.id ? 'ring-2 ring-tech-blue' : ''
              }`}
              onClick={() => setTheme(themeOption.id)}
            >
              {theme === themeOption.id && (
                <Check className="h-4 w-4 absolute top-2 right-2 text-tech-green" />
              )}
              <div className="font-medium">{themeOption.name}</div>
              <div className="text-xs text-gray-400 mt-1">{themeOption.description}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
