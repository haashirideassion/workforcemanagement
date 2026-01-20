import { CircleNotch } from '@phosphor-icons/react';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export function Loading({ message = 'Loading...', fullPage = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <CircleNotch size={32} className="animate-spin text-brand-600 mb-4" />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
