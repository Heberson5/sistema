'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { cemiteriosConfig } from '@/config/resources';

export default function CemiteriosPage() {
  return <ResourceCrudPage config={cemiteriosConfig} />;
}
