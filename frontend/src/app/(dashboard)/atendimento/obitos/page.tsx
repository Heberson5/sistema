'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { obitosConfig } from '@/config/resources';

export default function ObitosPage() {
  return <ResourceCrudPage config={obitosConfig} />;
}
