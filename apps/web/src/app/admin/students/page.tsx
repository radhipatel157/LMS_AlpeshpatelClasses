'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Field, TextArea } from '@/components/ui/field';
import { deleteData, getData, getPaginatedData, patchData } from '@/lib/api';
import type { Standard, StudentProfile, User } from '@/types/api';

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const students = useQuery({ queryKey: ['students'], queryFn: () => getPaginatedData<StudentProfile[]>('/students') });
  const users = useQuery({ queryKey: ['student-users'], queryFn: () => getPaginatedData<User[]>('/users', { params: { role: 'STUDENT', perPage: 100 } }) });
  const standards = useQuery({ queryKey: ['standards'], queryFn: () => getData<Standard[]>('/standards') });
  const updateStudent = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, FormDataEntryValue> }) =>
      patchData(`/students/${id}`, {
        standardId: body.standardId || undefined,
        parentPhone: body.parentPhone || undefined,
        address: body.address || undefined,
        dateOfBirth: body.dateOfBirth || undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });
  const removeStudent = useMutation({
    mutationFn: (id: string) => deleteData(`/students/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  return (
    <>
      <PageHeader title="Students" description="Manage student enrollment, parent contact, and class assignment." />
      <Card className="mb-4">
        <CardHeader><CardTitle>Student Accounts</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Create student login accounts from Users. New STUDENT users automatically receive a student profile here.
        </CardContent>
      </Card>
      <DataTable
        data={students.data?.data}
        columns={[
          { key: 'name', header: 'Student', cell: (row) => row.user?.name ?? row.userId },
          { key: 'email', header: 'Email', cell: (row) => row.user?.email ?? '-' },
          { key: 'standard', header: 'Standard', cell: (row) => row.standard?.name ?? '-' },
          { key: 'parent', header: 'Parent phone', cell: (row) => row.parentPhone ?? '-' },
          {
            key: 'edit',
            header: 'Profile',
            cell: (row) => (
              <form className="grid min-w-72 gap-2" onSubmit={(event) => {
                event.preventDefault();
                updateStudent.mutate({ id: row.id, body: Object.fromEntries(new FormData(event.currentTarget)) });
              }}>
                <select name="standardId" className="h-9 rounded-md border bg-background px-2 text-sm" defaultValue={row.standardId ?? ''}>
                  <option value="">No standard</option>
                  {standards.data?.map((standard) => <option key={standard.id} value={standard.id}>{standard.name}</option>)}
                </select>
                <Field label="Parent phone" name="parentPhone" defaultValue={row.parentPhone ?? ''} />
                <Field label="DOB" name="dateOfBirth" type="date" defaultValue={row.dateOfBirth?.slice(0, 10) ?? ''} />
                <TextArea label="Address" name="address" defaultValue={row.address ?? ''} />
                <div className="flex gap-2">
                  <Button size="sm" disabled={updateStudent.isPending}>Save</Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => removeStudent.mutate(row.id)}>Delete</Button>
                </div>
              </form>
            ),
          },
        ]}
      />
      <div className="mt-3 text-sm text-muted-foreground">
        {students.data?.meta?.total ?? 0} student profiles. {users.data?.data.length ?? 0} student users available.
      </div>
    </>
  );
}
