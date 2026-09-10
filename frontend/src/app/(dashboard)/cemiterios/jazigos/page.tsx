'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { jazigosConfig } from '@/config/resources';

export default function JazigosPage() {
  return <ResourceCrudPage config={jazigosConfig} />;
}
