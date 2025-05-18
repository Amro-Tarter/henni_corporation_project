import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'green',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        className: 'my-toast',
        duration: 5000,
      }}
    />
  )
}
