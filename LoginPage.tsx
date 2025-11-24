import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, TrendingDown, FileText } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
      <header className="border-b border-emerald-200/50 bg-white/50 backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">AI Prompt Optimizer</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              AI Prompt Optimizer
            </h1>
            <p className="mb-12 text-xl text-emerald-700 dark:text-emerald-300">
              Optimize your AI prompts to reduce carbon emissions and improve efficiency
            </p>

            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-8 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                  Smart Analysis
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Analyze prompt length, complexity, and efficiency with real-time feedback.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-8 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                  Token Reduction
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Automatically optimize prompts to reduce token usage and carbon footprint.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-8 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                  Impact Reports
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Track your optimization history and view detailed savings reports.
                </p>
              </div>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="h-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-12 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:opacity-50"
            >
              {isLoggingIn ? 'Connecting...' : 'Login to Get Started'}
            </Button>
          </div>
        </div>
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
