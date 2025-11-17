import { useState, useEffect, useCallback } from 'react';
import type { JobRequest, TimelineEntry } from '@/types/job';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// Database row types
interface TimelineEntryRow {
  id: string;
  kind: string;
  summary_zh: string | null;
  summary_en: string | null;
  summary_de: string | null;
  date: string;
}

interface JobRow {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  preferred_schedule: string;
  budget_range: string | null;
  urgency: string;
  status: string;
  assigned_professional_id: string | null;
  timeline_entries?: TimelineEntryRow[];
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load jobs from Supabase
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setJobs([]);
      return;
    }

    const currentUser = user; // Capture user for closure

    async function loadJobs() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch jobs with timeline entries
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            timeline_entries (
              id,
              kind,
              summary_zh,
              summary_en,
              summary_de,
              date
            )
          `)
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Transform data to match JobRequest type
        const transformedJobs: JobRequest[] = (jobsData || []).map((job: JobRow) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          description: job.description,
          location: job.location,
          preferredSchedule: job.preferred_schedule,
          budgetRange: job.budget_range || undefined,
          urgency: job.urgency as '一般' | '急件',
          status: job.status as JobRequest['status'],
          assignedProfessionalId: job.assigned_professional_id || undefined,
          timeline: (job.timeline_entries || []).map((entry: TimelineEntryRow): TimelineEntry => ({
            id: entry.id,
            kind: entry.kind as TimelineEntry['kind'],
            summary: {
              zh: entry.summary_zh || '',
              en: entry.summary_en || '',
              de: entry.summary_de || '',
            },
            date: entry.date,
          })),
        }));

        setJobs(transformedJobs);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          loadJobs(); // Reload on changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addJob = useCallback(
    async (job: JobRequest) => {
      if (!user) throw new Error('User not authenticated');

      try {
        // Insert job
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .insert({
            user_id: user.id,
            title: job.title,
            category: job.category,
            description: job.description,
            location: job.location,
            preferred_schedule: job.preferredSchedule,
            budget_range: job.budgetRange,
            urgency: job.urgency,
            status: job.status,
            assigned_professional_id: job.assignedProfessionalId,
          })
          .select()
          .single();

        if (jobError) throw jobError;

        // Insert timeline entries
        if (job.timeline && job.timeline.length > 0) {
          const { error: timelineError } = await supabase.from('timeline_entries').insert(
            job.timeline.map((entry) => ({
              job_id: jobData.id,
              kind: entry.kind,
              summary_zh: entry.summary.zh,
              summary_en: entry.summary.en,
              summary_de: entry.summary.de,
              date: entry.date,
            }))
          );

          if (timelineError) throw timelineError;
        }

        // Reload jobs to get the new one with timeline
        const { data: updatedJobs } = await supabase
          .from('jobs')
          .select('*, timeline_entries(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (updatedJobs) {
          const transformed = updatedJobs.map((j: JobRow): JobRequest => ({
            id: j.id,
            title: j.title,
            category: j.category,
            description: j.description,
            location: j.location,
            preferredSchedule: j.preferred_schedule,
            budgetRange: j.budget_range || undefined,
            urgency: j.urgency as '一般' | '急件',
            status: j.status as JobRequest['status'],
            assignedProfessionalId: j.assigned_professional_id || undefined,
            timeline: (j.timeline_entries || []).map((e: TimelineEntryRow): TimelineEntry => ({
              id: e.id,
              kind: e.kind as TimelineEntry['kind'],
              summary: { zh: e.summary_zh || '', en: e.summary_en || '', de: e.summary_de || '' },
              date: e.date,
            })),
          }));
          setJobs(transformed);
        }
      } catch (err) {
        console.error('Failed to create job:', err);
        throw err;
      }
    },
    [user]
  );

  const updateJob = useCallback(
    async (id: string, updates: Partial<JobRequest>) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const updateData: Partial<{
          title: string;
          status: string;
          assigned_professional_id: string | null;
          category: string;
          description: string;
          location: string;
          preferred_schedule: string;
          budget_range: string | null;
          urgency: string;
        }> = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.status) updateData.status = updates.status;
        if (updates.assignedProfessionalId !== undefined)
          updateData.assigned_professional_id = updates.assignedProfessionalId || null;
        if (updates.category) updateData.category = updates.category;
        if (updates.description) updateData.description = updates.description;
        if (updates.location) updateData.location = updates.location;
        if (updates.preferredSchedule) updateData.preferred_schedule = updates.preferredSchedule;
        if (updates.budgetRange !== undefined) updateData.budget_range = updates.budgetRange || null;
        if (updates.urgency) updateData.urgency = updates.urgency;

        const { error } = await supabase
          .from('jobs')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        // If timeline updates, handle separately
        if (updates.timeline) {
          // Delete existing timeline entries
          await supabase.from('timeline_entries').delete().eq('job_id', id);

          // Insert new timeline entries
          if (updates.timeline.length > 0) {
            const { error: timelineError } = await supabase.from('timeline_entries').insert(
              updates.timeline.map((entry) => ({
                job_id: id,
                kind: entry.kind,
                summary_zh: entry.summary.zh,
                summary_en: entry.summary.en,
                summary_de: entry.summary.de,
                date: entry.date,
              }))
            );
            if (timelineError) throw timelineError;
          }
        }

        // Reload jobs
        const { data } = await supabase
          .from('jobs')
          .select('*, timeline_entries(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          const transformed = data.map((j: JobRow): JobRequest => ({
            id: j.id,
            title: j.title,
            category: j.category,
            description: j.description,
            location: j.location,
            preferredSchedule: j.preferred_schedule,
            budgetRange: j.budget_range || undefined,
            urgency: j.urgency as '一般' | '急件',
            status: j.status as JobRequest['status'],
            assignedProfessionalId: j.assigned_professional_id || undefined,
            timeline: (j.timeline_entries || []).map((e: TimelineEntryRow): TimelineEntry => ({
              id: e.id,
              kind: e.kind as TimelineEntry['kind'],
              summary: { zh: e.summary_zh || '', en: e.summary_en || '', de: e.summary_de || '' },
              date: e.date,
            })),
          }));
          setJobs(transformed);
        }
      } catch (err) {
        console.error('Failed to update job:', err);
        throw err;
      }
    },
    [user]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { error } = await supabase.from('jobs').delete().eq('id', id).eq('user_id', user.id);
        if (error) throw error;

        setJobs((prev) => prev.filter((job) => job.id !== id));
      } catch (err) {
        console.error('Failed to delete job:', err);
        throw err;
      }
    },
    [user]
  );

  return {
    jobs,
    isLoading,
    error,
    addJob,
    updateJob,
    deleteJob,
  };
}
