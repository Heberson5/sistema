import Cookies from 'js-cookie';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

export function salvarSessao(token: string, usuario: UsuarioLogado) {
  Cookies.set('token', token, { expires: 1 });
  Cookies.set('usuario', JSON.stringify(usuario), { expires: 1 });
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
