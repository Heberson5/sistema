'use client';

import { ResourceCrudPage } from '@/components/crud/ResourceCrudPage';
import { usuariosConfig } from '@/config/resources';

export default function UsuariosPage() {
  return <ResourceCrudPage config={usuariosConfig} />;
}
