'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { pessoasConfig } from '@/config/resources';

export default function PessoasPage() {
  return <ResourceCrudPage config={pessoasConfig} />;
}
