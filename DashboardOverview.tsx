import { useGetPromptOptimizations, useGenerateReport } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingDown, Zap, Lightbulb, Target, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardOverview() {
  const { data: optimizations, isLoading: optsLoading } = useGetPromptOptimizations();
  const { data: report, isLoading: reportLoading } = useGenerateReport();

  if (optsLoading || reportLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalOptimizations = optimizations?.length || 0;
  const totalSavings = report?.totalSavings || 0;

  // Calculate total token reduction
  const totalTokensReduced = optimizations?.reduce((sum, opt) => {
    return sum + (Number(opt.originalLength) - Number(opt.optimizedLength));
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">Dashboard Overview</h2>
        <p className="text-emerald-700 dark:text-emerald-300">
          Track your prompt optimization metrics at a glance
        </p>
      </div>

      {/* Introductory Section */}
      <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950 dark:to-teal-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            Welcome to the Prompt Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">What is the Prompt Optimizer?</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  The Prompt Optimizer helps you rewrite AI prompts to use fewer tokens while communicating more effectively. 
                  By streamlining your prompts, you get clearer, more focused responses from AI models.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">How does it work?</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Our optimizer removes unnecessary words, clarifies instructions, and streamlines structure for maximum efficiency. 
                  It applies proven optimization rules like eliminating filler phrases, using direct commands, and adding output constraints.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Leaf className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Why does this matter?</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Shorter prompts reduce compute load and energy consumption in AI systems. This leads to measurable carbon savings—
                  beneficial for both companies reducing operational costs and the environment. Every optimized prompt contributes to a more sustainable AI ecosystem.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/50">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              💡 <strong>Get started:</strong> Navigate to the "Prompt Optimizer" tab to begin optimizing your prompts and tracking your carbon savings!
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Total Optimizations
            </CardTitle>
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{totalOptimizations}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Prompts optimized</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              CO₂ Savings
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {totalSavings.toFixed(6)} kg
            </div>
            <p className="text-xs text-teal-600 dark:text-teal-400">Estimated carbon reduction</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Tokens Reduced
            </CardTitle>
            <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {totalTokensReduced.toLocaleString()}
            </div>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">Characters saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {totalOptimizations === 0 ? (
              <p className="text-center text-emerald-600 dark:text-emerald-400">
                No activity yet. Start by optimizing your first prompt!
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">Optimizations</span>
                  <span className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    {totalOptimizations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">Avg. Reduction</span>
                  <span className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    {totalOptimizations > 0 ? Math.round(totalTokensReduced / totalOptimizations) : 0} chars
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">Impact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-emerald-700 dark:text-emerald-300">Optimization Progress</span>
                  <span className="font-medium text-emerald-900 dark:text-emerald-100">
                    {totalOptimizations > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                    style={{ width: totalOptimizations > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-emerald-700 dark:text-emerald-300">Carbon Savings</span>
                  <span className="font-medium text-emerald-900 dark:text-emerald-100">
                    {totalSavings > 0 ? totalSavings.toFixed(6) : '0.000000'} kg
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-600"
                    style={{
                      width: totalSavings > 0 ? `${Math.min(100, (totalSavings / 0.01) * 100)}%` : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
