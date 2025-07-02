import '../css/app.css';

import theme from '@/theme';

import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { hydrateRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Use dynamic imports for page components to enable code splitting
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob(['./pages/**/*.tsx', '../../app-modules/*/resources/js/pages/**/*.tsx']);

        const regex = /([^:]+)::(.+)/;
        const matches = regex.exec(name);

        if (matches && matches.length > 2) {
            const module = matches[1].toLowerCase();
            const page = matches[2];

            return pages[`../../app-modules/${module}/resources/js/pages/${page}.tsx`]();
        } else {
            return pages[`./pages/${name}.tsx`]();
        }
    },

    setup({ el, App, props }) {
        hydrateRoot(
            el,
            <MantineProvider theme={theme}>
                <Notifications />
                <App {...props} />
            </MantineProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
