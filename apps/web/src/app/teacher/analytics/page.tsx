'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getData } from '@/lib/api';

type TeacherStudents = {
  students: Array<{ studentId: string; name: string; email: string; avgCompletion: number }>;
  weakStudents: Array<{ studentId: string; name: string; avgCompletion: number }>;
};

export default function TeacherAnalyticsPage() {
  const data = useQuery({ queryKey: ['teacher-students'], queryFn: () => getData<TeacherStudents>('/analytics/teacher/my-students') });
  return (
    <>
      <PageHeader title="Engagement Analytics" description="Completion trends and at-risk student flags." />
      <div className="grid gap-4 xl:grid-cols-2">
        <StudentBars title="Student Completion" students={data.data?.students} />
        <StudentBars title="At-risk Students" students={data.data?.weakStudents} />
      </div>
    </>
  );
}

function StudentBars({ title, students }: { title: string; students?: Array<{ studentId: string; name: string; avgCompletion: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {students?.length ? students.map((student) => (
          <div key={student.studentId}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{student.name}</span>
              <span>{student.avgCompletion}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(student.avgCompletion, 100)}%` }} />
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">No data yet</p>}
      </CardContent>
    </Card>
  );
}
