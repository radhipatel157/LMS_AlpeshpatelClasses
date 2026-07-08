'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Field, TextArea } from '@/components/ui/field';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { deleteData, getData, patchData, postData, uploadFile } from '@/lib/api';
import type { Assignment, Lesson } from '@/types/api';

export default function TeacherAssignmentsPage() {
  const queryClient = useQueryClient();
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: () => getData<Assignment[]>('/assignments') });
  const lessons = useQuery({ queryKey: ['lessons'], queryFn: () => getData<Lesson[]>('/lessons') });
  const createAssignment = useMutation({
    mutationFn: async (body: Record<string, FormDataEntryValue>) => {
      const file = body.attachment;
      const uploaded =
        file instanceof File && file.size > 0 ? await uploadFile(file, 'myclass/assignment-attachments') : null;

      return postData('/assignments', {
        lessonId: body.lessonId,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        maxMarks: Number(body.maxMarks || 100),
        allowResubmission: body.allowResubmission === 'on',
        attachments: uploaded
          ? [{
              url: uploaded.url,
              fileName: uploaded.fileName,
              mimeType: uploaded.mimeType,
              fileSize: uploaded.fileSize,
            }]
          : [],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });
  const publishAssignment = useMutation({
    mutationFn: (id: string) => patchData(`/assignments/${id}/publish`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });
  const closeAssignment = useMutation({
    mutationFn: (id: string) => patchData(`/assignments/${id}/close`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });
  const archiveAssignment = useMutation({
    mutationFn: (id: string) => deleteData(`/assignments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
  });

  return (
    <>
      <PageHeader title="Assignments" description="Create, publish, close, and review student work." />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              createAssignment.mutate(Object.fromEntries(new FormData(event.currentTarget)));
              event.currentTarget.reset();
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Lesson</span>
              <select name="lessonId" className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                <option value="">Select lesson</option>
                {lessons.data?.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
              </select>
            </label>
            <Field label="Title" name="title" required />
            <Field label="Due date" name="dueDate" type="datetime-local" required />
            <Field label="Max marks" name="maxMarks" type="number" defaultValue={100} />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Attachment</span>
              <input
                name="attachment"
                type="file"
                className="block w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </label>
            <div className="lg:col-span-2">
              <TextArea label="Instructions" name="description" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="allowResubmission" />
              Allow resubmission
            </label>
            <div className="lg:col-span-2">
              {createAssignment.isError ? (
                <div className="mb-3 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  Could not create assignment. Check the lesson, date, marks, and file type.
                </div>
              ) : null}
              <Button disabled={createAssignment.isPending}>
                {createAssignment.isPending ? 'Saving...' : 'Create assignment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <DataTable
        data={assignments.data}
        columns={[
          { key: 'title', header: 'Title', cell: (row) => row.title },
          { key: 'lesson', header: 'Lesson', cell: (row) => row.lesson?.title ?? '-' },
          { key: 'deadline', header: 'Deadline', cell: (row) => formatDate(row.deadline) },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge value={row.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                {row.status !== 'published' ? (
                  <Button size="sm" variant="secondary" onClick={() => publishAssignment.mutate(row.id)}>Publish</Button>
                ) : null}
                {row.status !== 'closed' ? (
                  <Button size="sm" variant="secondary" onClick={() => closeAssignment.mutate(row.id)}>Close</Button>
                ) : null}
                <Link className="text-sm font-medium text-primary" href={`/teacher/assignments/${row.id}`}>Review</Link>
                <Button size="sm" variant="danger" onClick={() => archiveAssignment.mutate(row.id)}>Archive</Button>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
