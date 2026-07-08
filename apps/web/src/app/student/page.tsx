'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Flame, PlayCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getData } from '@/lib/api';
import type { Video } from '@/types/api';

type Progress = { progressPercentage: number; completedLessons: number; totalLessons: number; assignmentScoreAvg: number };
type Streak = { streak: number; dailyWatchTime: Array<{ date: string; seconds: number }> };

export default function StudentDashboardPage() {
  const progress = useQuery({ queryKey: ['student-progress'], queryFn: () => getData<Progress>('/analytics/student/progress') });
  const streak = useQuery({ queryKey: ['student-streak'], queryFn: () => getData<Streak>('/analytics/student/streak') });
  const continueWatching = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => getData<Array<{ video: Video; lastPosition: number }>>('/video-progress/continue-watching'),
  });

  return (
    <>
      <PageHeader title="Student Dashboard" description="Continue learning, track progress, and review assignments." />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Overall progress" value={`${progress.data?.progressPercentage ?? 0}%`} icon={<BookOpen size={20} />} />
        <Stat label="Current streak" value={`${streak.data?.streak ?? 0} days`} icon={<Flame size={20} />} />
        <Stat label="Assignment average" value={`${progress.data?.assignmentScoreAvg ?? 0}%`} icon={<PlayCircle size={20} />} />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Continue Watching</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {continueWatching.data?.length ? continueWatching.data.map((item) => (
            <Link key={item.video.id} className="rounded-md border p-3 hover:bg-muted" href={`/student/learn/videos/${item.video.id}`}>
              <p className="font-medium">{item.video.title}</p>
              <p className="text-sm text-muted-foreground">{item.lastPosition}s watched</p>
            </Link>
          )) : <p className="text-sm text-muted-foreground">No in-progress videos yet.</p>}
        </CardContent>
      </Card>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className="text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
