'use client';

import { useAuth } from '@/components/AuthProvider';
import LoginPage from '@/components/LoginPage';
import Header from '@/components/Header';
import CapturePage from '@/components/CapturePage';

export default function CaptureRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <LoginPage />
    );
  }

  return (
    <CapturePage />
  );
}
