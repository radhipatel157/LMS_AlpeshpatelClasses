'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Field, TextArea } from '@/components/ui/field';
import { deleteData, getPaginatedData, patchData } from '@/lib/api';
import type { TeacherProfile, User } from '@/types/api';

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();
  const teachers = useQuery({ queryKey: ['teachers'], queryFn: () => getPaginatedData<TeacherProfile[]>('/teachers') });
  const users = useQuery({ queryKey: ['teacher-users'], queryFn: () => getPaginatedData<User[]>('/users', { params: { role: 'TEACHER', perPage: 100 } }) });
  const updateTeacher = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, FormDataEntryValue> }) =>
      patchData(`/teachers/${id}`, { qualification: body.qualification || undefined, bio: body.bio || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  });
  const removeTeacher = useMutation({
    mutationFn: (id: string) => deleteData(`/teachers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  });

  return (
    <>
      <PageHeader title="Teachers" description="Manage teacher profiles, qualifications, and bios." />
      <Card className="mb-4">
        <CardHeader><CardTitle>Teacher Accounts</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Create teacher login accounts from Users. New TEACHER users automatically receive a teacher profile here.
        </CardContent>
      </Card>
      <DataTable
        data={teachers.data?.data}
        columns={[
          { key: 'name', header: 'Teacher', cell: (row) => row.user?.name ?? row.userId },
          { key: 'email', header: 'Email', cell: (row) => row.user?.email ?? '-' },
          { key: 'phone', header: 'Phone', cell: (row) => row.user?.phone ?? '-' },
          { key: 'qualification', header: 'Qualification', cell: (row) => row.qualification ?? '-' },
          {
            key: 'edit',
            header: 'Profile',
            cell: (row) => (
              <form className="grid min-w-72 gap-2" onSubmit={(event) => {
                event.preventDefault();
                updateTeacher.mutate({ id: row.id, body: Object.fromEntries(new FormData(event.currentTarget)) });
              }}>
                <Field label="Qualification" name="qualification" defaultValue={row.qualification ?? ''} />
                <TextArea label="Bio" name="bio" defaultValue={row.bio ?? ''} />
                <div className="flex gap-2">
                  <Button size="sm" disabled={updateTeacher.isPending}>Save</Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => removeTeacher.mutate(row.id)}>Delete</Button>
                </div>
              </form>
            ),
          },
        ]}
      />
      <div className="mt-3 text-sm text-muted-foreground">
        {teachers.data?.meta?.total ?? 0} teacher profiles. {users.data?.data.length ?? 0} teacher users available.
      </div>
    </>
  );
}
