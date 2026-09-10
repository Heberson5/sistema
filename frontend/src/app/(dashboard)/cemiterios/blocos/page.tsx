'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { blocosConfig } from '@/config/resources';

export default function BlocosPage() {
  return <ResourceCrudPage config={blocosConfig} />;
}
