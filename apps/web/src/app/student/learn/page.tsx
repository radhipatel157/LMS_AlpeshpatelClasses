'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getData } from '@/lib/api';
import type { Lesson, Standard, Subject, Video } from '@/types/api';

export default function StudentLearnPage() {
  const standards = useQuery({ queryKey: ['standards'], queryFn: () => getData<Standard[]>('/standards') });
  const subjects = useQuery({ queryKey: ['subjects'], queryFn: () => getData<Subject[]>('/subjects') });
  const lessons = useQuery({ queryKey: ['lessons'], queryFn: () => getData<Lesson[]>('/lessons') });
  const videos = useQuery({ queryKey: ['videos'], queryFn: () => getData<Video[]>('/videos') });

  return (
    <>
      <PageHeader title="Learn" description="Browse subjects, lessons, videos, notes, and assignments." />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {standards.data?.map((standard) => (
              <div key={standard.id}>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{standard.name}</p>
                {subjects.data?.filter((subject) => subject.standardId === standard.id).map((subject) => (
                  <div key={subject.id} className="rounded-md border p-2 text-sm">{subject.name}</div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons.data?.map((lesson) => (
              <div key={lesson.id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{lesson.title}</p>
                  <StatusBadge value={lesson.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {videos.data?.filter((video) => video.lessonId === lesson.id).map((video) => (
                    <Link key={video.id} href={`/student/learn/videos/${video.id}`} className="rounded-md border px-3 py-2 text-sm text-primary">
                      {video.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
