'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { produtosConfig } from '@/config/resources';

export default function ProdutosPage() {
  return <ResourceCrudPage config={produtosConfig} />;
}
