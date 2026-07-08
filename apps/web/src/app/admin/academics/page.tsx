'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { StatusBadge } from '@/components/ui/status-badge';
import { deleteData, getData, postData } from '@/lib/api';
import type { Chapter, Lesson, Standard, Subject } from '@/types/api';

export default function AdminAcademicsPage() {
  const queryClient = useQueryClient();
  const standards = useQuery({ queryKey: ['standards'], queryFn: () => getData<Standard[]>('/standards') });
  const subjects = useQuery({ queryKey: ['subjects'], queryFn: () => getData<Subject[]>('/subjects') });
  const chapters = useQuery({ queryKey: ['chapters'], queryFn: () => getData<Chapter[]>('/chapters') });
  const lessons = useQuery({ queryKey: ['lessons'], queryFn: () => getData<Lesson[]>('/lessons') });
  const createStandard = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) => postData('/standards', { name: body.name, order: Number(body.order || 0) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['standards'] }),
  });
  const createSubject = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      postData('/subjects', {
        standardId: body.standardId,
        name: body.name,
        description: body.description || undefined,
        order: Number(body.order || 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['standards'] });
    },
  });
  const createChapter = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      postData('/chapters', { subjectId: body.subjectId, name: body.name, order: Number(body.order || 0) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapters'] }),
  });
  const createLesson = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      postData('/lessons', {
        chapterId: body.chapterId,
        title: body.title,
        description: body.description || undefined,
        order: Number(body.order || 0),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });
  const archive = useMutation({
    mutationFn: ({ resource, id }: { resource: 'standards' | 'subjects' | 'chapters' | 'lessons'; id: string }) =>
      deleteData(`/${resource}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  return (
    <>
      <PageHeader title="Academic Builder" description="Review standards, subjects, chapters, lessons, and resources." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="grid gap-3 sm:grid-cols-[1fr_110px_auto]" onSubmit={(event) => submitForm(event, createStandard.mutate)}>
              <Field label="Name" name="name" placeholder="Class 10" required />
              <Field label="Order" name="order" type="number" defaultValue={0} />
              <div className="flex items-end"><Button disabled={createStandard.isPending}>Add</Button></div>
            </form>
            <RecordList
              items={standards.data?.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: `${item._count?.subjects ?? 0} subjects, ${item._count?.students ?? 0} students`,
              }))}
              onArchive={(id) => archive.mutate({ resource: 'standards', id })}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="grid gap-3" onSubmit={(event) => submitForm(event, createSubject.mutate)}>
              <SelectField label="Standard" name="standardId" options={standards.data?.map((x) => [x.id, x.name])} />
              <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                <Field label="Name" name="name" placeholder="Mathematics" required />
                <Field label="Order" name="order" type="number" defaultValue={0} />
              </div>
              <Field label="Description" name="description" />
              <Button disabled={createSubject.isPending}>Add subject</Button>
            </form>
            <RecordList
              items={subjects.data?.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: item.standard?.name ?? 'No standard',
              }))}
              onArchive={(id) => archive.mutate({ resource: 'subjects', id })}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chapters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="grid gap-3" onSubmit={(event) => submitForm(event, createChapter.mutate)}>
              <SelectField label="Subject" name="subjectId" options={subjects.data?.map((x) => [x.id, `${x.name} - ${x.standard?.name ?? ''}`])} />
              <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto]">
                <Field label="Name" name="name" placeholder="Algebra" required />
                <Field label="Order" name="order" type="number" defaultValue={0} />
                <div className="flex items-end"><Button disabled={createChapter.isPending}>Add</Button></div>
              </div>
            </form>
            <RecordList
              items={chapters.data?.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: item.subject?.name ?? 'No subject',
              }))}
              onArchive={(id) => archive.mutate({ resource: 'chapters', id })}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="grid gap-3" onSubmit={(event) => submitForm(event, createLesson.mutate)}>
              <SelectField label="Chapter" name="chapterId" options={chapters.data?.map((x) => [x.id, `${x.name} - ${x.subject?.name ?? ''}`])} />
              <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                <Field label="Title" name="title" required />
                <Field label="Order" name="order" type="number" defaultValue={0} />
              </div>
              <Field label="Description" name="description" />
              <Button disabled={createLesson.isPending}>Add lesson</Button>
            </form>
            <div className="space-y-2">
              {lessons.data?.length ? lessons.data.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.chapter?.name ?? 'No chapter'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={lesson.status} />
                    <Button size="sm" variant="danger" onClick={() => archive.mutate({ resource: 'lessons', id: lesson.id })}>Archive</Button>
                  </div>
                </div>
              )) : <div className="text-sm text-muted-foreground">No records</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function submitForm(event: FormEvent<HTMLFormElement>, mutate: (body: Record<string, FormDataEntryValue>) => void) {
  event.preventDefault();
  mutate(Object.fromEntries(new FormData(event.currentTarget)));
  event.currentTarget.reset();
}

function SelectField({ label, name, options }: { label: string; name: string; options?: Array<[string, string]> }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select name={name} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
        <option value="">Select</option>
        {options?.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  );
}

function RecordList({ items, onArchive }: { items?: Array<{ id: string; title: string; subtitle?: string }>; onArchive: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {items?.length ? items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            {item.subtitle ? <p className="text-xs text-muted-foreground">{item.subtitle}</p> : null}
          </div>
          <Button size="sm" variant="danger" onClick={() => onArchive(item.id)}>Archive</Button>
        </div>
      )) : <div className="text-sm text-muted-foreground">No records</div>}
    </div>
  );
}
