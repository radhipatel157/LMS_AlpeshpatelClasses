'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, TextArea } from '@/components/ui/field';
import { getData, patchData, uploadFile } from '@/lib/api';
import { getRole, useMe } from '@/hooks/use-auth';
import type { Standard, StudentProfile, TeacherProfile } from '@/types/api';

export function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const me = useMe();
  const role = getRole(me.data);
  const standards = useQuery({ queryKey: ['standards'], queryFn: () => getData<Standard[]>('/standards'), enabled: role === 'STUDENT' });
  const student = useQuery({ queryKey: ['student-profile'], queryFn: () => getData<StudentProfile>('/students/me'), enabled: role === 'STUDENT' });
  const teacher = useQuery({ queryKey: ['teacher-profile'], queryFn: () => getData<TeacherProfile>('/teachers/me'), enabled: role === 'TEACHER' });

  const updateProfile = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) => patchData('/profile', { name: body.name, phone: body.phone || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
  const updateAvatar = useMutation({
    mutationFn: async (body: Record<string, FormDataEntryValue>) => {
      const file = body.avatar;
      if (!(file instanceof File) || file.size === 0) throw new Error('Avatar file is required');
      const uploaded = await uploadFile(file, 'myclass/avatars');
      return patchData('/profile/avatar', { avatarUrl: uploaded.url });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
  const changePassword = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      patchData('/profile/password', { currentPassword: body.currentPassword, newPassword: body.newPassword }),
  });
  const updateStudent = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      patchData('/students/me', {
        standardId: body.standardId || undefined,
        parentPhone: body.parentPhone || undefined,
        address: body.address || undefined,
        dateOfBirth: body.dateOfBirth || undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-profile'] }),
  });
  const updateTeacher = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      patchData('/teachers/me', { qualification: body.qualification || undefined, bio: body.bio || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-profile'] }),
  });

  return (
    <>
      <PageHeader title="Profile Settings" description="Manage account details, avatar, password, and role profile." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => submitForm(event, updateProfile.mutate)}>
              <Field label="Name" name="name" defaultValue={me.data?.name ?? ''} required />
              <Field label="Phone" name="phone" defaultValue={me.data?.phone ?? ''} />
              <Field label="Email" value={me.data?.email ?? ''} disabled readOnly />
              <Button disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving...' : 'Save account'}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => submitForm(event, updateAvatar.mutate)}>
              {me.data?.avatarUrl ? <img src={me.data.avatarUrl} alt="" className="h-16 w-16 rounded-md object-cover" /> : null}
              <input name="avatar" type="file" accept="image/*" className="block w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground" required />
              <Button disabled={updateAvatar.isPending}>{updateAvatar.isPending ? 'Uploading...' : 'Upload avatar'}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Password</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => submitForm(event, changePassword.mutate)}>
              <Field label="Current password" name="currentPassword" type="password" minLength={8} required />
              <Field label="New password" name="newPassword" type="password" minLength={8} required />
              {changePassword.isSuccess ? <p className="text-sm text-success">Password changed. Sign in again if your session expires.</p> : null}
              <Button disabled={changePassword.isPending}>Change password</Button>
            </form>
          </CardContent>
        </Card>
        {role === 'STUDENT' ? (
          <Card>
            <CardHeader><CardTitle>Student Profile</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={(event) => submitForm(event, updateStudent.mutate)}>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Standard</span>
                  <select name="standardId" className="h-10 w-full rounded-md border bg-background px-3 text-sm" defaultValue={student.data?.standardId ?? ''}>
                    <option value="">Select standard</option>
                    {standards.data?.map((standard) => <option key={standard.id} value={standard.id}>{standard.name}</option>)}
                  </select>
                </label>
                <Field label="Parent phone" name="parentPhone" defaultValue={student.data?.parentPhone ?? ''} />
                <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={student.data?.dateOfBirth?.slice(0, 10) ?? ''} />
                <TextArea label="Address" name="address" defaultValue={student.data?.address ?? ''} />
                <Button disabled={updateStudent.isPending}>Save student profile</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
        {role === 'TEACHER' ? (
          <Card>
            <CardHeader><CardTitle>Teacher Profile</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={(event) => submitForm(event, updateTeacher.mutate)}>
                <Field label="Qualification" name="qualification" defaultValue={teacher.data?.qualification ?? ''} />
                <TextArea label="Bio" name="bio" defaultValue={teacher.data?.bio ?? ''} />
                <Button disabled={updateTeacher.isPending}>Save teacher profile</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}

function submitForm(event: React.FormEvent<HTMLFormElement>, mutate: (body: Record<string, FormDataEntryValue>) => void) {
  event.preventDefault();
  mutate(Object.fromEntries(new FormData(event.currentTarget)));
  event.currentTarget.reset();
}
