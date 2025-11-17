import { useState, useEffect, useCallback } from 'react';
import type { JobRequest } from '@/types/job';
import { jobs as initialJobs } from '@/data/sampleData';

const JOBS_STORAGE_KEY = 'engineer-finder-jobs';

export function useJobs() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from localStorage or use initial data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that it's an array
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(parsed);
          setIsLoading(false);
          return;
        }
      }
      // If no stored data or invalid, use initial data
      const initial = initialJobs.map((job) => ({ ...job, timeline: [...job.timeline] }));
      setJobs(initial);
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(initial));
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs');
      // Fallback to initial data
      const initial = initialJobs.map((job) => ({ ...job, timeline: [...job.timeline] }));
      setJobs(initial);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && jobs.length > 0) {
      try {
        localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      } catch (err) {
        console.error('Failed to save jobs:', err);
        setError('Failed to save jobs');
      }
    }
  }, [jobs, isLoading]);

  const addJob = useCallback((job: JobRequest) => {
    setJobs((prev) => [job, ...prev]);
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<JobRequest>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
    );
  }, []);

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const resetJobs = useCallback(() => {
    const initial = initialJobs.map((job) => ({ ...job, timeline: [...job.timeline] }));
    setJobs(initial);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(initial));
  }, []);

  return {
    jobs,
    isLoading,
    error,
    addJob,
    updateJob,
    deleteJob,
    resetJobs,
  };
}

