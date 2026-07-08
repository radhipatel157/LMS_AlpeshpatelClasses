'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Field } from '@/components/ui/field';
import { getPaginatedData, postData } from '@/lib/api';
import type { PageMeta, User } from '@/types/api';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const users = useQuery({ queryKey: ['users'], queryFn: () => getPaginatedData<User[]>('/users') });
  const createUser = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) => postData('/users', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
    },
  });

  return (
    <>
      <PageHeader
        title="Users"
        description="Create and manage administrator, teacher, and student accounts."
        actions={
          <Button onClick={() => setShowForm((value) => !value)}>
            <Plus size={16} />
            Add user
          </Button>
        }
      />
      {showForm ? (
        <Card className="mb-4">
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-5"
              onSubmit={(event) => {
                event.preventDefault();
                createUser.mutate(Object.fromEntries(new FormData(event.currentTarget)));
              }}
            >
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Role</span>
                <select name="role" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              <Field label="Password" name="password" type="password" minLength={8} required />
              <div className="md:col-span-5">
                <Button disabled={createUser.isPending}>{createUser.isPending ? 'Creating...' : 'Create user'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <DataTable
        data={users.data?.data}
        columns={[
          { key: 'name', header: 'Name', cell: (row) => row.name },
          { key: 'email', header: 'Email', cell: (row) => row.email },
          { key: 'phone', header: 'Phone', cell: (row) => row.phone ?? '-' },
          {
            key: 'role',
            header: 'Role',
            cell: (row) => (typeof row.role === 'string' ? row.role : row.role?.name ?? 'Unknown'),
          },
          { key: 'status', header: 'Status', cell: (row) => (row.isActive === false ? 'Inactive' : 'Active') },
        ]}
      />
      {users.data?.meta ? <UserMeta meta={users.data.meta as PageMeta} /> : null}
    </>
  );
}

function UserMeta({ meta }: { meta: PageMeta }) {
  return (
    <div className="mt-3 text-sm text-muted-foreground">
      Showing {meta.total ?? 0} users
    </div>
  );
}
