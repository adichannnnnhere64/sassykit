import { Link } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <Link href={route('home')}>
            <AppLogoIcon />
        </Link>
    );
}
