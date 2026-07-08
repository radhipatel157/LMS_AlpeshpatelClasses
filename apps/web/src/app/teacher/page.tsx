'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ClipboardCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { getData } from '@/lib/api';

type TeacherStudents = {
  students: Array<{ studentId: string; name: string; avgCompletion: number }>;
  weakStudents: Array<{ studentId: string; name: string; avgCompletion: number }>;
};

export default function TeacherDashboardPage() {
  const data = useQuery({ queryKey: ['teacher-students'], queryFn: () => getData<TeacherStudents>('/analytics/teacher/my-students') });
  const stats = [
    { label: 'Tracked students', value: data.data?.students.length ?? 0, icon: Users },
    { label: 'At-risk students', value: data.data?.weakStudents.length ?? 0, icon: AlertTriangle },
    { label: 'Pending reviews', value: 'Open', icon: ClipboardCheck },
  ];

  return (
    <>
      <PageHeader title="Teacher Dashboard" description="Student progress, assignments, and lesson engagement." />
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                </div>
                <Icon className="text-primary" size={22} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
