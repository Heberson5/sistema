'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { salasComerciaisConfig } from '@/config/resources';

export default function SalasComerciaisPage() {
  return <ResourceCrudPage config={salasComerciaisConfig} />;
}
