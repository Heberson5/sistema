'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { procedimentosMedicosConfig } from '@/config/resources';

export default function ProcedimentosMedicosPage() {
  return <ResourceCrudPage config={procedimentosMedicosConfig} />;
}
