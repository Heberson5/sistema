'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { planoCoberturasConfig } from '@/config/resources';

export default function PlanoCoberturasPage() {
  return <ResourceCrudPage config={planoCoberturasConfig} />;
}
