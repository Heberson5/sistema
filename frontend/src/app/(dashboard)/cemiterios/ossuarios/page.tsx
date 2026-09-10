'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { ossuariosConfig } from '@/config/resources';

export default function OssuariosPage() {
  return <ResourceCrudPage config={ossuariosConfig} />;
}
