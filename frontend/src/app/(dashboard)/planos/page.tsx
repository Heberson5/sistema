'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { planosConfig } from '@/config/resources';

export default function PlanosPage() {
  return <ResourceCrudPage config={planosConfig} />;
}
