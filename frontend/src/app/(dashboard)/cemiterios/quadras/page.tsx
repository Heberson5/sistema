'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { quadrasConfig } from '@/config/resources';

export default function QuadrasPage() {
  return <ResourceCrudPage config={quadrasConfig} />;
}
