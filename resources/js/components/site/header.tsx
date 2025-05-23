import { useTranslation } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Anchor,
    Box,
    Burger,
    Button,
    Center,
    Collapse,
    Divider,
    Drawer,
    Group,
    HoverCard,
    ScrollArea,
    SimpleGrid,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconCode } from '@tabler/icons-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import AppLogo from '../app-logo';
import AppLogoIcon from '../app-logo-icon';
import { ColorModeSwitch } from '../color-mode-switch';
import { LanguageSelector } from '../language-selector';

const mockdata = [
    {
        icon: IconCode,
        title: 'Open source',
        description: 'This Pokémon’s cry is very loud and distracting',
    },
];

function userAccount(auth: SharedData['auth'], __: ReturnType<typeof useTranslation>) {
    if (auth.user) {
        return (
            <>
                <Anchor href={route('dashboard')}>{__('general.greeting', { name: auth.user.name })}</Anchor> |
                <Anchor className="cursor-pointer" method="post" href={route('logout')}>
                    logout
                </Anchor>
            </>
        );
    }

    return (
        <>
            <Anchor href={route('login')}>
                <Button variant="default">Login</Button>
            </Anchor>
            <Anchor href={route('register')}>
                <Button variant="filled">Register</Button>
            </Anchor>
        </>
    );
}

export function SiteHeader({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' }) {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const theme = useMantineTheme();

    const [scrolled, setScrolled] = useState(false);

    const { auth } = usePage<SharedData>().props;
    const __ = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = mockdata.map((item) => (
        <UnstyledButton key={item.title}>
            <Group wrap="nowrap" align="flex-start">
                <ThemeIcon size={34} variant="default" radius="md">
                    <item.icon size={22} color={theme.colors.blue[6]} />
                </ThemeIcon>
                <div>
                    <Text size="sm" fw={500}>
                        {item.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {item.description}
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    ));

    return (
        <Box
            className={clsx('sticky top-0 z-2 h-18 w-full transition-colors duration-300', {
                'bg-orange-200/60 dark:bg-black/60': scrolled,
                'bg-orange-200/60 dark:bg-black': !scrolled && variant !== 'secondary',
            })}
        >
            <header className={cn('relative mx-auto h-18 px-4 text-white')}>
                <Group className="mx-auto !max-w-7xl" justify="space-between" h="100%">
                    <Group h="100%" gap={0} visibleFrom="sm">
                        <AppLogo />
                        <Link href={route('home')} className="dark:text-primary flex items-center px-2 text-sm font-bold text-black">
                            Home
                        </Link>
                        <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                            <HoverCard.Target>
                                <a href="#" className="dark:text-primary flex items-center px-2 text-sm font-bold text-black">
                                    <Center inline>
                                        <Box component="span" mr={5}>
                                            Features
                                        </Box>
                                        <IconChevronDown size={16} color={theme.colors.blue[6]} />
                                    </Center>
                                </a>
                            </HoverCard.Target>

                            <HoverCard.Dropdown className="mt-3" style={{ overflow: 'hidden' }}>
                                <Group justify="space-between" px="md">
                                    <Text fw={500}>Features</Text>
                                    <Anchor href="#" fz="xs">
                                        View all
                                    </Anchor>
                                </Group>

                                <Divider my="sm" />

                                <SimpleGrid cols={2} spacing={0}>
                                    {links}
                                </SimpleGrid>

                                <div>
                                    <Group justify="space-between">
                                        <div>
                                            <Text fw={500} fz="sm">
                                                Get started
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                Their food sources have decreased, and their numbers
                                            </Text>
                                        </div>
                                        <Button variant="default">Get started</Button>
                                    </Group>
                                </div>
                            </HoverCard.Dropdown>
                        </HoverCard>
                        <Link href={route('plans.index')} className="dark:text-primary flex items-center px-2 text-sm font-bold text-black">
                            Plans
                        </Link>
                    </Group>
                    <Group visibleFrom="sm" className="">
                        {userAccount(auth, __)}
                        <LanguageSelector />
                        <ColorModeSwitch />
                    </Group>

                    <Group hiddenFrom="sm">
                        <AppLogoIcon />
                    </Group>
                    <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
                </Group>
            </header>

            <Drawer opened={drawerOpened} onClose={closeDrawer} size="75%" padding="md" title="Navigation" hiddenFrom="sm" zIndex={1000000}>
                <ScrollArea h="calc(100vh - 80px" mx="-md">
                    <Divider my="sm" />

                    <Link href={route('home')} className="flex items-center px-4">
                        Home
                    </Link>
                    <UnstyledButton className="mx-4 flex items-center" onClick={toggleLinks}>
                        <Center inline>
                            <Box component="span" mr={5}>
                                Features
                            </Box>
                            <IconChevronDown size={16} color={theme.colors.blue[6]} />
                        </Center>
                    </UnstyledButton>
                    <Collapse in={linksOpened}>{links}</Collapse>
                    <Link href={route('plans.index')} className="flex items-center px-4">
                        Plans
                    </Link>

                    <Divider my="sm" />

                    <Group>{userAccount(auth, __)}</Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}
