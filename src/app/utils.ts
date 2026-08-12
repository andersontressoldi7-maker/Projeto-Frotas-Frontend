import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from './components/toast.service';
import { DialogService } from './components/dialog/dialog.service';

export function exibirMensagemUsuario(
  toastService: ToastService,
  mensagem: string,
  titulo = 'Sucesso'
): void {
  toastService.sucesso(mensagem, titulo);
}

export function exibirErroUsuario(
  toastService: ToastService,
  mensagem: string,
  titulo = 'Erro'
): void {
  toastService.erro(mensagem, titulo);
}

export function exibirPerguntaUsuario(
  dialogService: DialogService,
  mensagem: string,
  titulo = 'Confirmação'
): Promise<boolean> {
  return dialogService.confirmar(mensagem, titulo);
}

export function extrairMensagemErro(
  erro: unknown,
  fallback = 'Ocorreu um erro inesperado.'
): string {
  if (!erro) {
    return fallback;
  }

  if (typeof erro === 'string') {
    return erro;
  }

  if (erro instanceof Error) {
    return erro.message || fallback;
  }

  if (erro instanceof HttpErrorResponse) {
    if (typeof erro.error === 'string' && erro.error) {
      return erro.error;
    }

    if (Array.isArray(erro.error) && erro.error.length > 0) {
      return erro.error.filter((item: unknown): item is string => typeof item === 'string').join(' ');
    }

    if (typeof erro.error?.message === 'string' && erro.error.message) {
      return erro.error.message;
    }

    if (Array.isArray(erro.error?.message) && erro.error.message.length > 0) {
      return erro.error.message.filter((item: unknown): item is string => typeof item === 'string').join(' ');
    }

    if (typeof erro.message === 'string' && erro.message) {
      return erro.message;
    }

    if (typeof erro.error?.detail === 'string' && erro.error.detail) {
      return erro.error.detail;
    }

    return fallback;
  }

  if (typeof erro === 'object' && erro !== null) {
    const anyErro = erro as { error?: any; message?: string | string[] };
    if (typeof anyErro.message === 'string' && anyErro.message) {
      return anyErro.message;
    }
    if (Array.isArray(anyErro.message) && anyErro.message.length > 0) {
      return anyErro.message.filter((item: unknown): item is string => typeof item === 'string').join(' ');
    }
    if (typeof anyErro.error === 'string' && anyErro.error) {
      return anyErro.error;
    }
    if (Array.isArray(anyErro.error) && anyErro.error.length > 0) {
      return anyErro.error.filter((item: unknown): item is string => typeof item === 'string').join(' ');
    }
    if (typeof anyErro.error?.message === 'string' && anyErro.error.message) {
      return anyErro.error.message;
    }
    if (Array.isArray(anyErro.error?.message) && anyErro.error.message.length > 0) {
      return anyErro.error.message.filter((item: unknown): item is string => typeof item === 'string').join(' ');
    }
  }

  return fallback;
}
