
'use client';

import { AddPlayerForm } from '@/components/add-player-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddPlayerPage() {
  const router = useRouter();

  const handleFormSubmitted = () => {
    // When the form is on its own page, we want to navigate away
    // after submission.
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
            <Trophy className="h-12 w-12 text-primary" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Register New Player</CardTitle>
            <CardDescription>
              Fill in the details below to add a new player to the scoreboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddPlayerForm onFormSubmitted={handleFormSubmitted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
