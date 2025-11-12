import { useMutation } from '@hooks/useMutation';

// REGISTRO
export const useRegisterUserMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/users/register',
        data,
        'Error al registrar, intenta de nuevo',
        false
      ),
    loading: post.loading,
    error: post.error,
  };
};

// LOGIN
export const useLoginUserMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/users/login',
        data,
        'Error al iniciar sesión, verifica tus datos',
        false
      ),
    loading: post.loading,
    error: post.error,
  };
};
