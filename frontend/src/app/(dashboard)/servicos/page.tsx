'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { servicosConfig } from '@/config/resources';

export default function ServicosPage() {
  return <ResourceCrudPage config={servicosConfig} />;
}
