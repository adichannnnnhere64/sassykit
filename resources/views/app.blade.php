<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {!! seo() !!}
    <link rel="preload" fetchpriority='high' as="image" href="/desktop-768.webp"
        imagesrcset="/mobile.webp 600w, /desktop-768.webp 768w, /desktop-1350.webp 1350w"
        imagesizes="(max-width: 639px) 100vw, (max-width: 768px) 100vw, 100vw" />

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? 'system' }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "SassyKit",
            "email": "mobistyle35@gmail.com",
            "contactPoint": {
                "@type": "ContactPoint",
                "areaServed": "PH"
            }
        }
    </script>

          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2165217194424630"
        crossorigin="anonymous"></script>

    <script defer src="https://analytics.761073128.xyz/script.js" data-website-id="0fe48d21-2642-4120-8a60-47f079cf8f75"></script>



    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="antialiased">
    @inertia
</body>

</html>
