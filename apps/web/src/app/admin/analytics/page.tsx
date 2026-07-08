'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getData } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const watchHours = useQuery({
    queryKey: ['admin-watch-hours'],
    queryFn: () => getData<Array<{ subject: string; watchHours: number }>>('/analytics/admin/watch-hours'),
  });
  const submissions = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: () => getData<Array<{ status: string; count: number }>>('/analytics/admin/submission-rate'),
  });
  const dau = useQuery({
    queryKey: ['admin-dau'],
    queryFn: () => getData<Array<{ date: string; count: number }>>('/analytics/admin/dau'),
  });

  return (
    <>
      <PageHeader title="Analytics" description="Watch time, submission distribution, and active usage trends." />
      <div className="grid gap-4 xl:grid-cols-3">
        <MetricList title="Watch Hours by Subject" items={watchHours.data?.map((x) => [x.subject, x.watchHours])} />
        <MetricList title="Submission Status" items={submissions.data?.map((x) => [x.status, x.count])} />
        <MetricList title="Daily Active Users" items={dau.data?.slice(-10).map((x) => [x.date, x.count])} />
      </div>
    </>
  );
}

function MetricList({ title, items }: { title: string; items?: Array<[string, number]> }) {
  const max = Math.max(...(items?.map((item) => item[1]) ?? [1]), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items?.length ? items.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{label}</span>
              <span className="font-medium">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">No data yet</p>}
      </CardContent>
    </Card>
  );
}
