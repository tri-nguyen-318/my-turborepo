'use client';

import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { Shield, Check } from 'lucide-react';
import type { RootState } from '@/store/store';
import { useListAdminUsersQuery, useSetUserRoleMutation } from '@/store/api';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const t = useTranslations('main');
  const user = useSelector((s: RootState) => s.auth.user);
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);

  const { data: users = [], isLoading } = useListAdminUsersQuery(undefined, {
    skip: !accessToken || user?.role !== 'ADMIN',
  });
  const [setRole] = useSetUserRoleMutation();

  if (!accessToken || user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-8">
      <div className="w-full max-w-3xl rounded-xl bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{t('adminPanel')}</h1>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== user.id && (
                        <Button
                          size="sm"
                          variant={u.role === 'ADMIN' ? 'outline' : 'default'}
                          onClick={() =>
                            setRole({ id: u.id, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })
                          }
                        >
                          {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        </Button>
                      )}
                      {u.id === user.id && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="h-3 w-3" /> You
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
