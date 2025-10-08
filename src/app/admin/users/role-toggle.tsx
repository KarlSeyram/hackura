
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { toggleAdminRole } from './actions';
import type { UserWithRole } from './definitions';
import { Loader2 } from 'lucide-react';

interface RoleToggleProps {
  user: UserWithRole;
  disabled: boolean;
}

export function RoleToggle({ user, disabled }: RoleToggleProps) {
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const result = await toggleAdminRole(user.uid, user.isAdmin);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Role for ${user.displayName || user.email} updated.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description:
          error instanceof Error ? error.message : 'Could not update user role.',
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Switch
          id={`admin-toggle-${user.uid}`}
          checked={user.isAdmin}
          onCheckedChange={handleToggle}
          disabled={disabled || isToggling}
          aria-label={`Toggle admin role for ${user.displayName}`}
        />
      )}
      <Label htmlFor={`admin-toggle-${user.uid}`} className="sr-only">
        Admin
      </Label>
    </div>
  );
}
