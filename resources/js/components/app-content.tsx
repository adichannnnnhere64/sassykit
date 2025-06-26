import * as React from 'react';

export function AppContent({ children, ...props }: React.PropsWithChildren) {
    return (
        <div className="mt-8 mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4" {...props}>
            {children}
        </div>
    );
}
