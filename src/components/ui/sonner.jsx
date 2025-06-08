import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertCircle, Loader2 } from 'lucide-react';

const Toaster = (props) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-center"
      className="toaster group"
      toastOptions={{
        style: {
          direction: 'rtl' // Hebrew right-to-left
        },
        classNames: {
          toast: ({ type }) => {
            const base = 'rtl group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-l-4 group-[.toaster]:shadow-lg flex items-center gap-3 px-4 py-3 text-sm';
            const typeClasses = {
              success: 'border-success',
              error: 'border-error',
              info: 'border-info',
              warning: 'border-warning',
            };
            return `${base} ${typeClasses[type] || ''}`;
          },
          duration: 6000,
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs px-3 py-1.5',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs px-3 py-1.5',
        },
      }}
      icons={{
        success: <CheckCircle className="w-6 h-6 text-success pl-2" />,
        error: <XCircle className="w-6 h-6 text-error pl-2" />,
        info: <Info className="w-6 h-6 text-info pl-2" />,
        warning: <AlertCircle className="w-6 h-6 text-warning pl-2" />,
        loading: <Loader2 className="w-6 h-6 animate-spin text-muted-foreground pl-2" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };