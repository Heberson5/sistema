'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { tiposColumbarioConfig } from '@/config/resources';

export default function TiposColumbarioPage() {
  return <ResourceCrudPage config={tiposColumbarioConfig} />;
}
