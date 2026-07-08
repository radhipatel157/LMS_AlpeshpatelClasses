'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';
import { getData, postData, uploadFile } from '@/lib/api';
import type { Assignment, Submission } from '@/types/api';

type SubmitWorkInput = {
  assignmentId: string;
  submissionId?: string;
  file: File;
};

export default function StudentAssignmentsPage() {
  const queryClient = useQueryClient();
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: () => getData<Assignment[]>('/assignments') });
  const submissions = useQuery({ queryKey: ['my-submissions'], queryFn: () => getData<Submission[]>('/submissions/my') });
  const submit = useMutation({
    mutationFn: async ({ assignmentId, submissionId, file }: SubmitWorkInput) => {
      const uploaded = await uploadFile(file, 'myclass/submissions');
      const body = {
        files: [
          {
            url: uploaded.url,
            fileName: uploaded.fileName,
            mimeType: uploaded.mimeType,
            fileSize: uploaded.fileSize,
          },
        ],
      };

      if (submissionId) {
        return postData(`/submissions/${submissionId}/resubmit`, body);
      }

      return postData('/submissions', { assignmentId, ...body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
  const submissionByAssignment = new Map(submissions.data?.map((item) => [item.assignmentId, item]) ?? []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const assignmentId = formData.get('assignmentId')?.toString() ?? '';
    const file = formData.get('file');
    const existingSubmission = submissionByAssignment.get(assignmentId);

    if (!assignmentId || !(file instanceof File) || file.size === 0) return;

    submit.mutate(
      { assignmentId, submissionId: existingSubmission?.id, file },
      { onSuccess: () => form.reset() },
    );
  }

  return (
    <>
      <PageHeader title="Assignments" description="Submit work and review your history." />
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Available Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.data?.length ? assignments.data.map((assignment) => {
              const submission = submissionByAssignment.get(assignment.id);
              const isPastDeadline = new Date(assignment.deadline).getTime() < Date.now();
              return (
              <div key={assignment.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">Due {formatDate(assignment.deadline)}</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.totalMarks} marks
                      {assignment.lesson?.title ? ` - ${assignment.lesson.title}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge value={submission?.status ?? (isPastDeadline ? 'past due' : 'pending')} />
                    {submission?.marksObtained !== null && submission?.marksObtained !== undefined ? (
                      <span className="text-xs font-medium">{submission.marksObtained}/{assignment.totalMarks}</span>
                    ) : null}
                  </div>
                </div>
                {assignment.instructions ? <p className="mt-2 text-sm text-muted-foreground">{assignment.instructions}</p> : null}
                {submission?.remarks ? (
                  <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                    <span className="font-medium">Teacher feedback: </span>{submission.remarks}
                  </div>
                ) : null}
                {assignment.attachments?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assignment.attachments.map((file) => (
                      <a key={file.url} href={file.url} target="_blank" className="text-sm font-medium text-primary">
                        {file.fileName ?? 'Attachment'}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );}) : <div className="text-sm text-muted-foreground">No assignments available.</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submit Work</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={handleSubmit}
            >
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Assignment</span>
                <select name="assignmentId" className="h-10 w-full rounded-md border bg-background px-3 text-sm" required>
                  <option value="">Select assignment</option>
                  {assignments.data?.map((assignment) => {
                    const existingSubmission = submissionByAssignment.get(assignment.id);
                    const isPastDeadline = new Date(assignment.deadline).getTime() < Date.now();
                    const disabled = isPastDeadline || Boolean(existingSubmission && !assignment.allowResubmission);
                    return (
                      <option key={assignment.id} value={assignment.id} disabled={disabled}>
                        {assignment.title}
                        {isPastDeadline ? ' - past due' : existingSubmission ? disabled ? ' - submitted' : ' - resubmit' : ''}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">File</span>
                <input
                  name="file"
                  type="file"
                  required
                  className="block w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                />
              </label>
              {submit.isError ? (
                <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  Submission failed. Check file type, size, and deadline.
                </div>
              ) : null}
              {submit.isSuccess ? <p className="text-sm text-success">Work submitted successfully.</p> : null}
              <Button disabled={submit.isPending}>{submit.isPending ? 'Uploading...' : 'Submit work'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {submissions.data?.map((submission) => (
            <div key={submission.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{submission.assignment?.title ?? submission.assignmentId}</p>
                <p className="text-sm text-muted-foreground">
                  {submission.marksObtained ?? '-'} marks - {formatDate(submission.submittedAt)}
                  {submission.isLate ? ' - late' : ''}
                </p>
                {submission.remarks ? <p className="text-sm text-muted-foreground">Feedback: {submission.remarks}</p> : null}
                <div className="mt-1 flex flex-wrap gap-2">
                  {submission.submittedFiles?.map((file) => (
                    <a key={file.url} href={file.url} target="_blank" className="text-sm font-medium text-primary">
                      {file.fileName ?? 'Submitted file'}
                    </a>
                  ))}
                </div>
              </div>
              <StatusBadge value={submission.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
