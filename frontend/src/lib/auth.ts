import Cookies from 'js-cookie';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

const cookieOptions = {
  expires: 1,
  sameSite: 'lax' as const,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

export function salvarSessao(token: string, usuario: UsuarioLogado) {
  Cookies.set('token', token, cookieOptions);
  Cookies.set('usuario', JSON.stringify(usuario), cookieOptions);
}

export function obterUsuario(): UsuarioLogado | null {
  const raw = Cookies.get('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function estaAutenticado(): boolean {
  return !!Cookies.get('token');
}

export function logout() {
  Cookies.remove('token');
  Cookies.remove('usuario');
  window.location.href = '/login';
}
