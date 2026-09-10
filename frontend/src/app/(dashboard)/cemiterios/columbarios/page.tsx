'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { columbariosConfig } from '@/config/resources';

export default function ColumbariosPage() {
  return <ResourceCrudPage config={columbariosConfig} />;
}
