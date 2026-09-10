'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { alamedasConfig } from '@/config/resources';

export default function AlamedasPage() {
  return <ResourceCrudPage config={alamedasConfig} />;
}
