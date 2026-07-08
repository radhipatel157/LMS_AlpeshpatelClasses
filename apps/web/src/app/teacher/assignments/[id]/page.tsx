'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Field, TextArea } from '@/components/ui/field';
import { StatusBadge } from '@/components/ui/status-badge';
import { getData, patchData } from '@/lib/api';
import type { Submission } from '@/types/api';

export default function TeacherAssignmentReviewPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const submissions = useQuery({
    queryKey: ['submissions', params.id],
    queryFn: () => getData<Submission[]>(`/submissions/${params.id}`),
  });
  const evaluate = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, FormDataEntryValue> }) =>
      patchData(`/submissions/${id}/evaluate`, {
        marks: Number(body.marks || 0),
        remarks: body.remarks,
        status: body.status,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions', params.id] }),
  });

  return (
    <>
      <PageHeader title="Submission Review" description="Evaluate files and publish marks." />
      <DataTable
        data={submissions.data}
        columns={[
          { key: 'student', header: 'Student', cell: (row) => row.student?.name ?? row.studentId },
          { key: 'files', header: 'Files', cell: (row) => row.submittedFiles?.map((file) => <a key={file.url} href={file.url} className="mr-2 text-primary" target="_blank">Open</a>) },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge value={row.status} /> },
          {
            key: 'evaluate',
            header: 'Evaluate',
            cell: (row) => (
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  evaluate.mutate({ id: row.id, body: Object.fromEntries(new FormData(event.currentTarget)) });
                }}
              >
                <Field label="Marks" name="marks" type="number" defaultValue={row.marksObtained ?? 0} />
                <TextArea label="Remarks" name="remarks" defaultValue={row.remarks ?? ''} />
                <select name="status" className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue="approved">
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button size="sm" disabled={evaluate.isPending}>Save</Button>
              </form>
            ),
          },
        ]}
      />
    </>
  );
}
