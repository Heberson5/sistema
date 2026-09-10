'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { prestadoresConfig } from '@/config/resources';

export default function PrestadoresPage() {
  return <ResourceCrudPage config={prestadoresConfig} />;
}
