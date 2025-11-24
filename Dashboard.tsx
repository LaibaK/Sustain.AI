import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, LogOut, Moon, Sun, Leaf } from 'lucide-react';
import { useTheme } from 'next-themes';
import PromptOptimizerModule from '../components/PromptOptimizerModule';
import ReportModule from '../components/ReportModule';
import DashboardOverview from '../components/DashboardOverview';

export default function Dashboard() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
      <header className="sticky top-0 z-50 border-b border-emerald-200/50 bg-white/80 backdrop-blur-md dark:border-emerald-800/50 dark:bg-emerald-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">AI Prompt Optimizer</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-100"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3 bg-white/80 p-1 dark:bg-emerald-900/30">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Leaf className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="optimizer"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Prompt Optimizer
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="optimizer">
            <PromptOptimizerModule />
          </TabsContent>

          <TabsContent value="report">
            <ReportModule />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-emerald-200/50 bg-white/50 backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/50">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-emerald-700 dark:text-emerald-300">
          © 2025. Built with love using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="font-medium underline">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
