import { useTranslation } from '@/hooks/use-translations';
import { Button, Text, Title } from '@mantine/core';

export default function Banner() {
    const __ = useTranslation();
    return (
        <>
            <div className="h-[400px] sm:h-[700px]"></div>
            <div className="absolute inset-0 h-[400px] sm:h-[700px]">
                <div className="relative h-[400px] w-full sm:h-[700px]">
                    <img
                        sizes="(max-width: 639px) 100vw, (max-width: 768px) 100vw, 100vw"
                        alt="Banner"
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                        className="block h-full w-full object-cover brightness-70"
                        srcSet="/mobile.webp 600w,
          /desktop-768.webp 768w,
          /desktop-1350.webp 1350w"
                        src="/desktop-768.webp"
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
                        <Title>{__('general.welcome_message')}</Title>
                        <Text className="!mb-2">Discover amazing content and connect with creators around the world.</Text>
                        <Button variant="gradient">Get Started</Button>
                    </div>
                </div>
            </div>
        </>
    );
}
