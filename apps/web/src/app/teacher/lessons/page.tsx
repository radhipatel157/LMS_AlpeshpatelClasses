'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { StatusBadge } from '@/components/ui/status-badge';
import { deleteData, getData, patchData, postData, uploadFile } from '@/lib/api';
import type { Chapter, Lesson, Video } from '@/types/api';

export default function TeacherLessonsPage() {
  const queryClient = useQueryClient();
  const lessons = useQuery({ queryKey: ['lessons'], queryFn: () => getData<Lesson[]>('/lessons') });
  const chapters = useQuery({ queryKey: ['chapters'], queryFn: () => getData<Chapter[]>('/chapters') });
  const videos = useQuery({ queryKey: ['videos'], queryFn: () => getData<Video[]>('/videos') });
  const lessonDetails = useQuery({
    queryKey: ['lesson-details', lessons.data?.map((lesson) => lesson.id).join(',')],
    queryFn: async () => {
      const entries = await Promise.all((lessons.data ?? []).map(async (lesson) => [lesson.id, await getData<Lesson>(`/lessons/${lesson.id}`)] as const));
      return new Map(entries);
    },
    enabled: Boolean(lessons.data?.length),
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
  const createVideo = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      postData('/videos', {
        lessonId: body.lessonId,
        title: body.title,
        youtubeIdOrUrl: body.youtubeIdOrUrl,
        duration: Number(body.duration || 1),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });
  const updateVideo = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, FormDataEntryValue> }) =>
      patchData(`/videos/${id}`, {
        title: body.title,
        youtubeIdOrUrl: body.youtubeIdOrUrl,
        duration: Number(body.duration || 1),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });
  const removeVideo = useMutation({
    mutationFn: (id: string) => deleteData(`/videos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });
  const addResource = useMutation({
    mutationFn: async (body: Record<string, FormDataEntryValue>) => {
      const file = body.file;
      if (!(file instanceof File) || file.size === 0) throw new Error('Resource file is required');
      const uploaded = await uploadFile(file, 'myclass/lesson-resources');
      return postData(`/lessons/${body.lessonId}/resources`, {
        title: body.title || uploaded.fileName,
        fileUrl: uploaded.url,
        type: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-details'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
  const removeResource = useMutation({
    mutationFn: ({ lessonId, resourceId }: { lessonId: string; resourceId: string }) =>
      deleteData(`/lessons/${lessonId}/resources/${resourceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-details'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
  const archiveLesson = useMutation({
    mutationFn: (lessonId: string) => deleteData(`/lessons/${lessonId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-details'] });
    },
  });
  const publishLesson = useMutation({
    mutationFn: (lessonId: string) => patchData(`/lessons/${lessonId}/publish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-details'] });
    },
  });

  return (
    <>
      <PageHeader title="Lessons & Videos" description="Create lessons, publish content, and attach YouTube videos." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => submitForm(event, createLesson.mutate)}>
              <SelectField label="Chapter" name="chapterId" options={chapters.data?.map((x) => [x.id, x.name])} />
              <Field label="Title" name="title" required />
              <Field label="Description" name="description" />
              <Field label="Order" name="order" type="number" defaultValue={0} />
              <Button disabled={createLesson.isPending}>Create lesson</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add Video</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => submitForm(event, createVideo.mutate)}>
              <SelectField label="Lesson" name="lessonId" options={lessons.data?.map((x) => [x.id, x.title])} />
              <Field label="Title" name="title" required />
              <Field label="YouTube ID or URL" name="youtubeIdOrUrl" required />
              <Field label="Duration seconds" name="duration" type="number" min={1} defaultValue={600} />
              <Button disabled={createVideo.isPending}>Add video</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Attach Lesson Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(event) => submitForm(event, addResource.mutate)}>
            <SelectField label="Lesson" name="lessonId" options={lessons.data?.map((x) => [x.id, x.title])} />
            <Field label="Title" name="title" placeholder="Worksheet PDF" />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">File</span>
              <input
                name="file"
                type="file"
                required
                className="block w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </label>
            <div className="flex items-end"><Button disabled={addResource.isPending}>{addResource.isPending ? 'Uploading...' : 'Attach'}</Button></div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lessons.data?.map((lesson) => {
              const detail = lessonDetails.data?.get(lesson.id);
              return (
              <div key={lesson.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.chapter?.name}</p>
                  {detail?.resources?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {detail.resources.map((resource) => (
                        <span key={resource.id} className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                          <a href={resource.fileUrl} target="_blank" className="font-medium text-primary">{resource.title}</a>
                          <button type="button" className="text-danger" onClick={() => removeResource.mutate({ lessonId: lesson.id, resourceId: resource.id })}>
                            Remove
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={lesson.status} />
                  {lesson.status !== 'published' ? (
                    <Button size="sm" variant="secondary" onClick={() => publishLesson.mutate(lesson.id)}>
                      Publish
                    </Button>
                  ) : null}
                  <Button size="sm" variant="danger" onClick={() => archiveLesson.mutate(lesson.id)}>Archive</Button>
                </div>
              </div>
            );})}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {videos.data?.map((video) => (
              <div key={video.id} className="rounded-md border p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.youtubeId} - {video.duration}s</p>
                  </div>
                  <Link href={`/teacher/progress?videoId=${video.id}`} className="text-sm font-medium text-primary">Progress</Link>
                </div>
                <form className="grid gap-2 sm:grid-cols-[1fr_1fr_110px_auto_auto]" onSubmit={(event) => {
                  event.preventDefault();
                  updateVideo.mutate({ id: video.id, body: Object.fromEntries(new FormData(event.currentTarget)) });
                }}>
                  <Field label="Title" name="title" defaultValue={video.title} required />
                  <Field label="YouTube ID/URL" name="youtubeIdOrUrl" defaultValue={video.youtubeId} required />
                  <Field label="Duration" name="duration" type="number" min={1} defaultValue={video.duration} />
                  <div className="flex items-end"><Button size="sm" disabled={updateVideo.isPending}>Save</Button></div>
                  <div className="flex items-end"><Button type="button" size="sm" variant="danger" onClick={() => removeVideo.mutate(video.id)}>Delete</Button></div>
                </form>
              </div>
            ))}
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
