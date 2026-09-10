'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { equipamentosOrtopedicosConfig } from '@/config/resources';

export default function EquipamentosOrtopedicosPage() {
  return <ResourceCrudPage config={equipamentosOrtopedicosConfig} />;
}
