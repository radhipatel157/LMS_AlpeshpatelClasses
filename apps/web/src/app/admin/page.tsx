'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, ClipboardCheck, GraduationCap, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { getData } from '@/lib/api';

type Overview = {
  totalStudents: number;
  totalTeachers: number;
  totalWatchHours: number;
  submissionRate: number;
  dauToday: number;
};

export default function AdminDashboardPage() {
  const overview = useQuery({ queryKey: ['admin-overview'], queryFn: () => getData<Overview>('/analytics/admin/overview') });

  const stats = [
    { label: 'Students', value: overview.data?.totalStudents ?? 0, icon: GraduationCap },
    { label: 'Teachers', value: overview.data?.totalTeachers ?? 0, icon: Users },
    { label: 'Watch hours', value: overview.data?.totalWatchHours ?? 0, icon: BarChart3 },
    { label: 'Submission rate', value: `${overview.data?.submissionRate ?? 0}%`, icon: ClipboardCheck },
  ];

  return (
    <>
      <PageHeader title="Admin Overview" description="System activity, users, and academic operations." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="mt-1 text-2xl font-semibold">{stat.value}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
