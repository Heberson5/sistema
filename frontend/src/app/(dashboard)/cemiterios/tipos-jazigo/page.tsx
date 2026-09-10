'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { tiposJazigoConfig } from '@/config/resources';

export default function TiposJazigoPage() {
  return <ResourceCrudPage config={tiposJazigoConfig} />;
}
