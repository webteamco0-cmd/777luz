import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Seven Luz';

void createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),

    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;

            case name.startsWith('auth/'):
                return AuthLayout;

            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];

            default:
                return AppLayout;
        }
    },

    strictMode: true,

    withApp(app) {
        return (
            <TooltipProvider delayDuration={120}>
                {app}
                <Toaster
                    position="top-center"
                    richColors
                    closeButton
                />
            </TooltipProvider>
        );
    },

    progress: {
        color: '#B99452',
        showSpinner: false,
    },
});

initializeTheme();