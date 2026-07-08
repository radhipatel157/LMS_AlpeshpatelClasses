'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getData } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { VideoProgress } from '@/types/api';

export default function StudentHistoryPage() {
  const history = useQuery({ queryKey: ['watch-history'], queryFn: () => getData<VideoProgress[]>('/video-progress/history') });

  return (
    <>
      <PageHeader title="Watch History" description="Review every video you have started, resumed, or completed." />
      <Card>
        <CardHeader><CardTitle>Learning Activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history.data?.length ? history.data.map((item) => {
            const percent = Number(item.completionPercentage ?? 0);
            return (
              <div key={item.id ?? item.videoId} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Link href={`/student/learn/videos/${item.videoId}`} className="font-medium text-primary">
                      {item.video?.title ?? item.videoId}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.video?.lesson?.title ?? 'Lesson'} - {item.lastWatchedAt ? formatDate(item.lastWatchedAt) : 'Not watched recently'}
                    </p>
                  </div>
                  <StatusBadge value={item.isCompleted ? 'completed' : 'in progress'} />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round(percent)}% complete, last position {Math.round(item.lastPosition)}s</p>
              </div>
            );
          }) : <p className="py-6 text-center text-sm text-muted-foreground">No watch history yet.</p>}
        </CardContent>
      </Card>
    </>
  );
}
