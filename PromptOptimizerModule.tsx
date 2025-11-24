import { useState, useEffect, useRef } from 'react';
import {
  useGetPromptOptimizations,
  useSavePromptOptimization,
  useClearPromptOptimizations,
  useAnalyzePrompt,
  useGetCurrentTime,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Info, TrendingDown, Zap, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import OptimizationsTable from './OptimizationsTable';
import type { PromptOptimization } from '../backend';

interface OptimizationStats {
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  estimatedSavings: number;
}

export default function PromptOptimizerModule() {
  const { data: optimizations, isLoading } = useGetPromptOptimizations();
  const saveOptimization = useSavePromptOptimization();
  const clearOptimizations = useClearPromptOptimizations();
  const analyzePrompt = useAnalyzePrompt();
  const { data: currentTime } = useGetCurrentTime();

  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [analysis, setAnalysis] = useState<{ length: bigint; complexity: number; estimatedSavings: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [efficiencyProgress, setEfficiencyProgress] = useState(0);
  const [appliedRules, setAppliedRules] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Track the last saved optimization to prevent duplicates
  const lastSavedIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save when optimization is complete
  useEffect(() => {
    // Only proceed if we have all required data and we're not currently saving
    if (!optimizedPrompt || !analysis || !stats || !originalPrompt || isSaving) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce auto-save to prevent rapid successive calls
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Generate a unique ID based on content and timestamp
        const contentHash = `${originalPrompt.substring(0, 50)}-${optimizedPrompt.substring(0, 50)}`;
        const timestamp = currentTime || BigInt(Date.now() * 1000000);
        const uniqueId = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

        // Check if we've already saved this exact optimization
        if (lastSavedIdRef.current === contentHash) {
          console.log('[Optimization] Skipping duplicate save for:', contentHash);
          return;
        }

        setIsSaving(true);

        const opt: PromptOptimization = {
          id: uniqueId,
          timestamp,
          originalPrompt,
          optimizedPrompt,
          originalLength: BigInt(originalPrompt.length),
          optimizedLength: BigInt(optimizedPrompt.length),
          estimatedSavings: stats.estimatedSavings,
        };

        console.log('[Optimization] Auto-saving optimization:', uniqueId);
        await saveOptimization.mutateAsync(opt);
        
        // Mark this optimization as saved
        lastSavedIdRef.current = contentHash;
        console.log('[Optimization] Successfully saved:', uniqueId);
      } catch (error: any) {
        console.error('[Optimization] Auto-save failed:', error);
        // Only show error toast if it's not a duplicate error
        if (!error.message?.includes('Duplicate')) {
          toast.error('Failed to save optimization');
        }
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [optimizedPrompt, analysis, stats, originalPrompt, currentTime, saveOptimization, isSaving]);

  const handleAnalyze = async () => {
    if (!originalPrompt.trim()) {
      toast.error('Please enter a prompt to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      setEfficiencyProgress(0);
      
      // Reset the last saved ID when starting a new analysis
      lastSavedIdRef.current = null;
      
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setEfficiencyProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await analyzePrompt.mutateAsync(originalPrompt);
      setAnalysis(result);

      const { optimized, rules } = applyOptimizationRules(originalPrompt);
      setOptimizedPrompt(optimized);
      setAppliedRules(rules);

      // Calculate statistics
      const originalTokens = estimateTokens(originalPrompt);
      const optimizedTokens = estimateTokens(optimized);
      const reductionPercentage = ((originalTokens - optimizedTokens) / originalTokens) * 100;
      const estimatedSavings = Number(result.estimatedSavings) * (reductionPercentage / 100);

      setStats({
        originalTokens,
        optimizedTokens,
        reductionPercentage,
        estimatedSavings: Math.max(0, estimatedSavings),
      });

      clearInterval(progressInterval);
      setEfficiencyProgress(100);

      toast.success('Prompt optimized successfully!');
    } catch (error) {
      toast.error('Failed to analyze prompt');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const estimateTokens = (text: string): number => {
    // Rough estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  };

  const applyOptimizationRules = (prompt: string): { optimized: string; rules: string[] } => {
    let optimized = prompt.trim();
    const rules: string[] = [];

    // Rule 1: Remove filler words and redundant phrases
    const fillerPatterns = [
      { pattern: /\b(hey|hi|hello),?\s*/gi, name: 'Removed greeting' },
      { pattern: /\bcould you\s+(please\s+)?/gi, name: 'Removed polite phrasing' },
      { pattern: /\bplease\s+/gi, name: 'Removed "please"' },
      { pattern: /\bI would like you to\s+/gi, name: 'Removed verbose request' },
      { pattern: /\bcan you\s+/gi, name: 'Removed "can you"' },
      { pattern: /\bmaybe\s+/gi, name: 'Removed uncertainty words' },
      { pattern: /\bkind of\s+/gi, name: 'Removed filler phrases' },
      { pattern: /\bsort of\s+/gi, name: 'Removed filler phrases' },
      { pattern: /\byou know\s+/gi, name: 'Removed conversational fillers' },
    ];

    fillerPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(optimized)) {
        optimized = optimized.replace(pattern, '');
        if (!rules.includes(name)) rules.push(name);
      }
    });

    // Rule 2: Shorten long instructions to direct commands
    optimized = optimized.replace(/I need you to\s+/gi, '');
    optimized = optimized.replace(/I want you to\s+/gi, '');
    if (/I (need|want) you to/i.test(prompt)) {
      rules.push('Converted to direct command');
    }

    // Rule 3: Replace verbose style descriptions with format instructions
    if (/in a (detailed|comprehensive|thorough) (manner|way)/i.test(optimized)) {
      optimized = optimized.replace(/in a (detailed|comprehensive|thorough) (manner|way)/gi, 'in detail');
      rules.push('Simplified style description');
    }

    // Rule 4: Provide structured output suggestions
    if (optimized.length > 200 && !optimized.includes('1)') && !optimized.includes('(1)')) {
      const sentences = optimized.split(/[.!?]+/).filter((s) => s.trim());
      if (sentences.length > 2) {
        optimized = 'Provide:\n' + sentences.slice(0, 3).map((s, i) => `${i + 1}) ${s.trim()}`).join('\n');
        rules.push('Added structured format');
      }
    }

    // Rule 5: Suggest placeholders for long content
    if (optimized.length > 500) {
      const words = optimized.split(/\s+/);
      if (words.length > 100) {
        optimized = words.slice(0, 50).join(' ') + '... [use placeholder for long content]';
        rules.push('Suggested placeholder for long content');
      }
    }

    // Rule 6: Limit request outputs
    if (/give me (all|many|several|multiple)/i.test(optimized)) {
      optimized = optimized.replace(/give me (all|many|several|multiple)/gi, 'Give me the best');
      rules.push('Limited output request');
    }

    // Rule 7: Add token-conscious constraints
    if (optimized.length > 300 && !/(in|under|within) \d+ words/i.test(optimized)) {
      optimized += ' (Answer in under 50 words)';
      rules.push('Added word limit constraint');
    }

    // Clean up extra whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();

    // Ensure we have at least some optimization
    if (rules.length === 0 && optimized.length < prompt.length) {
      rules.push('Removed extra whitespace');
    }

    return { optimized, rules };
  };

  const handleReset = () => {
    setOriginalPrompt('');
    setOptimizedPrompt('');
    setAnalysis(null);
    setStats(null);
    setEfficiencyProgress(0);
    setAppliedRules([]);
    setIsSaving(false);
    lastSavedIdRef.current = null;
    
    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  const handleDeleteHistory = async () => {
    try {
      await clearOptimizations.mutateAsync();
      toast.success('Optimization history cleared successfully!');
    } catch (error) {
      toast.error('Failed to clear optimization history');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">Prompt Optimization</h2>
          <p className="text-emerald-700 dark:text-emerald-300">
            Analyze and refine your prompts to reduce energy consumption
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Info className="h-4 w-4" />
              Optimization Guide
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Prompt Optimization Principles</SheetTitle>
              <SheetDescription>
                Learn how to write efficient prompts that reduce carbon emissions
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  1. Remove Filler Words
                </h3>
                <p className="text-sm text-muted-foreground">
                  Eliminate unnecessary politeness and conversational phrases.
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-red-600">❌ Before:</p>
                  <p className="mb-2">"Hey, could you please maybe help me understand..."</p>
                  <p className="font-medium text-green-600">✓ After:</p>
                  <p>"Explain..."</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  2. Use Direct Commands
                </h3>
                <p className="text-sm text-muted-foreground">
                  Replace long instructions with concise directives.
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-red-600">❌ Before:</p>
                  <p className="mb-2">"I would like you to write a summary..."</p>
                  <p className="font-medium text-green-600">✓ After:</p>
                  <p>"Summarize..."</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  3. Structured Output
                </h3>
                <p className="text-sm text-muted-foreground">
                  Request organized responses with clear formatting.
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-red-600">❌ Before:</p>
                  <p className="mb-2">"Tell me about the benefits and drawbacks..."</p>
                  <p className="font-medium text-green-600">✓ After:</p>
                  <p>"List: 1) Benefits 2) Drawbacks"</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  4. Use Placeholders
                </h3>
                <p className="text-sm text-muted-foreground">
                  Replace long pasted content with references.
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-red-600">❌ Before:</p>
                  <p className="mb-2">"[500 words of text]... analyze this"</p>
                  <p className="font-medium text-green-600">✓ After:</p>
                  <p>"Analyze [document] for key themes"</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  5. Limit Output
                </h3>
                <p className="text-sm text-muted-foreground">
                  Request specific, focused responses.
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-red-600">❌ Before:</p>
                  <p className="mb-2">"Give me all possible solutions..."</p>
                  <p className="font-medium text-green-600">✓ After:</p>
                  <p>"Give me the best 3 solutions"</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  6. Add Word Limits
                </h3>
                <p className="text-sm text-muted-foreground">
                  Specify token-conscious constraints.
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-red-600">❌ Before:</p>
                  <p className="mb-2">"Explain quantum computing"</p>
                  <p className="font-medium text-green-600">✓ After:</p>
                  <p>"Explain quantum computing in under 50 words"</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
            <Sparkles className="h-5 w-5" />
            Optimize Your Prompt
          </CardTitle>
          <CardDescription className="text-emerald-600 dark:text-emerald-400">
            Enter your prompt to receive automatic optimization suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="original" className="text-emerald-900 dark:text-emerald-100">
              Original Prompt
            </Label>
            <Textarea
              id="original"
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={6}
              className="resize-none"
            />
            {analysis && (
              <div className="flex flex-wrap gap-4 text-sm text-emerald-600 dark:text-emerald-400">
                <span>Length: {Number(analysis.length)} chars</span>
                <span>Complexity: {analysis.complexity.toFixed(2)}</span>
                <span>Est. CO₂: {analysis.estimatedSavings.toFixed(6)} kg</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !originalPrompt.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze & Optimize'}
            </Button>
            {optimizedPrompt && (
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            )}
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-700 dark:text-emerald-300">Optimizing prompt...</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">{efficiencyProgress}%</span>
              </div>
              <Progress value={efficiencyProgress} className="h-2" />
            </div>
          )}

          {optimizedPrompt && stats && (
            <>
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="optimized" className="text-emerald-900 dark:text-emerald-100">
                  Optimized Prompt (Editable)
                </Label>
                <Textarea
                  id="optimized"
                  value={optimizedPrompt}
                  onChange={(e) => setOptimizedPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Analysis Report Card */}
              <Card className="border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950 dark:to-teal-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-900 dark:text-emerald-100">
                    <TrendingDown className="h-5 w-5" />
                    Optimization Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Original Tokens</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {stats.originalTokens}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Optimized Tokens</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {stats.optimizedTokens}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Reduction</p>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {stats.reductionPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">CO₂ Saved</p>
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {stats.estimatedSavings.toFixed(6)} kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-emerald-900 dark:text-emerald-100">
                        Efficiency Improvement
                      </span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {stats.reductionPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={stats.reductionPercentage} className="h-3" />
                  </div>

                  {appliedRules.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                        Applied Optimizations:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {appliedRules.map((rule, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/50">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {isSaving ? '💾 Saving optimization...' : '💡 This optimization has been automatically saved to your history'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      {optimizations && optimizations.length > 0 && (
        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                  <Sparkles className="h-5 w-5" />
                  Optimization History
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-400">
                  Your saved prompt optimizations
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your saved prompt optimizations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteHistory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <OptimizationsTable optimizations={optimizations} />
          </CardContent>
        </Card>
      )}

      {(!optimizations || optimizations.length === 0) && !optimizedPrompt && (
        <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="mb-4 h-16 w-16 text-emerald-400 dark:text-emerald-600" />
            <p className="text-center text-emerald-700 dark:text-emerald-300">
              No optimizations saved yet. Start optimizing your prompts!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
