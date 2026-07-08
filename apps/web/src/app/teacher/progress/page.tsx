'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { getData } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Video, VideoProgress } from '@/types/api';

export default function TeacherProgressPage() {
  const searchParams = useSearchParams();
  const [videoId, setVideoId] = useState(searchParams.get('videoId') ?? '');
  const videos = useQuery({ queryKey: ['videos'], queryFn: () => getData<Video[]>('/videos') });
  const report = useQuery({
    queryKey: ['teacher-video-progress', videoId],
    queryFn: () => getData<VideoProgress[]>(`/video-progress/teacher/${videoId}`),
    enabled: Boolean(videoId),
  });

  return (
    <>
      <PageHeader title="Video Progress" description="See student progress for a selected video." />
      <Card className="mb-4">
        <CardHeader><CardTitle>Select Video</CardTitle></CardHeader>
        <CardContent>
          <select value={videoId} onChange={(event) => setVideoId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="">Select video</option>
            {videos.data?.map((video) => <option key={video.id} value={video.id}>{video.title}</option>)}
          </select>
        </CardContent>
      </Card>
      <DataTable
        data={report.data}
        empty={videoId ? 'No student progress for this video yet' : 'Select a video to view progress'}
        columns={[
          { key: 'student', header: 'Student', cell: (row) => row.student?.name ?? row.studentId ?? '-' },
          { key: 'email', header: 'Email', cell: (row) => row.student?.email ?? '-' },
          { key: 'completion', header: 'Completion', cell: (row) => `${Math.round(Number(row.completionPercentage ?? 0))}%` },
          { key: 'position', header: 'Last position', cell: (row) => `${Math.round(row.lastPosition ?? 0)}s` },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge value={row.isCompleted ? 'completed' : 'in progress'} /> },
          { key: 'watched', header: 'Last watched', cell: (row) => row.lastWatchedAt ? formatDate(row.lastWatchedAt) : '-' },
        ]}
      />
    </>
  );
}
