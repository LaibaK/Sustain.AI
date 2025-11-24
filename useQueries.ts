import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, PromptOptimization, ReportSummary, UserRole } from '../backend';

// Access Control Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const role = await actor.getCallerUserRole();
        console.log('[Access Control] User role:', role);
        return role;
      } catch (error: any) {
        console.error('[Access Control] Error fetching user role:', error);
        // If error contains "not registered" or similar, return guest
        if (error.message?.includes('not registered') || error.message?.includes('Unauthorized')) {
          return 'guest' as UserRole;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useInitializeAccessControl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[Access Control] Calling initializeAccessControl...');
      await actor.initializeAccessControl();
      console.log('[Access Control] initializeAccessControl completed');
    },
    onSuccess: () => {
      console.log('[Access Control] Invalidating queries after initialization');
      // Invalidate all queries to refetch with proper permissions
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['promptOptimizations'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('[Profile] User profile fetched:', profile ? 'exists' : 'null');
        return profile;
      } catch (error: any) {
        console.error('[Profile] Error fetching user profile:', error);
        // If unauthorized or not registered, treat as no profile
        if (error.message?.includes('Unauthorized') || error.message?.includes('not registered')) {
          console.log('[Profile] User not authorized yet, returning null');
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[Profile] Saving user profile:', profile);
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      console.log('[Profile] Profile saved successfully');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('[Profile] Error saving profile:', error);
    },
  });
}

// Prompt Optimizations Queries
export function useGetPromptOptimizations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PromptOptimization[]>({
    queryKey: ['promptOptimizations'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const optimizations = await actor.getPromptOptimizations();
        console.log('[Optimizations] Fetched prompt optimizations:', optimizations.length);
        return optimizations;
      } catch (error: any) {
        console.error('[Optimizations] Error fetching prompt optimizations:', error);
        // Return empty array if unauthorized (access control not initialized)
        if (error.message?.includes('Unauthorized') || error.message?.includes('not registered')) {
          console.log('[Optimizations] User not authorized, returning empty array');
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSavePromptOptimization() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opt: PromptOptimization) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[Optimizations] Saving prompt optimization:', opt);
      return actor.savePromptOptimization(opt);
    },
    onSuccess: () => {
      console.log('[Optimizations] Optimization saved successfully');
      queryClient.invalidateQueries({ queryKey: ['promptOptimizations'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
    onError: (error) => {
      console.error('[Optimizations] Error saving optimization:', error);
    },
  });
}

export function useClearPromptOptimizations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[Optimizations] Clearing all prompt optimizations');
      return actor.clearPromptOptimizations();
    },
    onSuccess: () => {
      console.log('[Optimizations] All optimizations cleared successfully');
      queryClient.invalidateQueries({ queryKey: ['promptOptimizations'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
    onError: (error) => {
      console.error('[Optimizations] Error clearing optimizations:', error);
    },
  });
}

// Report Query
export function useGenerateReport() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ReportSummary>({
    queryKey: ['report'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const report = await actor.generateReport();
        console.log('[Report] Generated report:', report);
        return report;
      } catch (error: any) {
        console.error('[Report] Error generating report:', error);
        // Return empty report if unauthorized
        if (error.message?.includes('Unauthorized') || error.message?.includes('not registered')) {
          console.log('[Report] User not authorized, returning empty report');
          return {
            totalSavings: 0,
            optimizations: [],
          };
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// Helper Queries
export function useAnalyzePrompt() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (prompt: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.analyzePrompt(prompt);
    },
  });
}

export function useGetCurrentTime() {
  const { actor } = useActor();

  return useQuery<bigint>({
    queryKey: ['currentTime'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCurrentTime();
    },
    enabled: !!actor,
    staleTime: 0,
  });
}
