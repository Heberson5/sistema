'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { beneficiariosConfig } from '@/config/resources';

export default function BeneficiariosPage() {
  return <ResourceCrudPage config={beneficiariosConfig} />;
}
