'use client';

import { useEffect } from 'react';
import { registerSW } from '@/lib/register-sw';

export function RegisterSW() {
  useEffect(() => {
    registerSW();
  }, []);

  return null;
}
