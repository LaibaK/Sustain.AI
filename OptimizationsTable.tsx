import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { PromptOptimization } from '../backend';

interface OptimizationsTableProps {
  optimizations: PromptOptimization[];
}

export default function OptimizationsTable({ optimizations }: OptimizationsTableProps) {
  const sortedOpts = [...optimizations].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div className="rounded-md border border-emerald-200 dark:border-emerald-800">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <TableHead className="text-emerald-900 dark:text-emerald-100">Date</TableHead>
            <TableHead className="text-emerald-900 dark:text-emerald-100">Original</TableHead>
            <TableHead className="text-emerald-900 dark:text-emerald-100">Optimized</TableHead>
            <TableHead className="text-emerald-900 dark:text-emerald-100">Reduction</TableHead>
            <TableHead className="text-right text-emerald-900 dark:text-emerald-100">Savings (kg)</TableHead>
            <TableHead className="text-right text-emerald-900 dark:text-emerald-100">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOpts.map((opt) => {
            const reduction = ((Number(opt.originalLength) - Number(opt.optimizedLength)) / Number(opt.originalLength)) * 100;
            return (
              <TableRow key={opt.id} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                <TableCell className="text-emerald-700 dark:text-emerald-300">
                  {new Date(Number(opt.timestamp) / 1000000).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-emerald-700 dark:text-emerald-300">
                  {Number(opt.originalLength)} chars
                </TableCell>
                <TableCell className="text-emerald-700 dark:text-emerald-300">
                  {Number(opt.optimizedLength)} chars
                </TableCell>
                <TableCell className="font-medium text-teal-600 dark:text-teal-400">{reduction.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-semibold text-emerald-900 dark:text-emerald-100">
                  {opt.estimatedSavings.toFixed(6)}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Optimization Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-semibold text-emerald-900 dark:text-emerald-100">Original Prompt</h4>
                          <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                            {opt.originalPrompt}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 font-semibold text-emerald-900 dark:text-emerald-100">Optimized Prompt</h4>
                          <p className="rounded-md bg-teal-50 p-3 text-sm text-emerald-900 dark:bg-teal-900/30 dark:text-emerald-100">
                            {opt.optimizedPrompt}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Reduction:</span>{' '}
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                              {reduction.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-700 dark:text-emerald-300">Savings:</span>{' '}
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                              {opt.estimatedSavings.toFixed(6)} kg CO₂
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
