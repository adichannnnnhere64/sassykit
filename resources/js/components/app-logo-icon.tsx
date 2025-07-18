import { Title } from '@mantine/core';

export default function AppLogoIcon() {
    return (
        <>
            <div className="dark:text-primary mr-4 flex cursor-pointer items-center text-2xl font-bold tracking-wide text-black">
                <Title size="2xl">Kewlor</Title>
                <Title size="xl" c="orange">
                    Site
                </Title>
            </div>
        </>
    );
}
