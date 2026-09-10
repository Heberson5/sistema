'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { alasConfig } from '@/config/resources';

export default function AlasPage() {
  return <ResourceCrudPage config={alasConfig} />;
}
