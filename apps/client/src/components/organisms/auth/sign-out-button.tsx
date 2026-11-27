import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/atom';

export function SignOutButton({ label }: { label: string }) {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await signOut();
    } finally {
      // This bar only exists on signed-in-only pages, which cannot render
      // without a session, so they fall back home.
      await navigate({ to: '/' });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleSignOut}
      className="gap-1.5 text-xs font-semibold"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Button>
  );
}
