import { toast } from 'react-toastify'

export const useNotifier = () => {
  const success = (msg) => toast.success(msg)
  const error = (msg) => toast.error(msg)
  const info = (msg) => toast.info(msg)
  const warn = (msg) => toast.warn(msg)

  return { success, error, info, warn }
}