<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Workspace</title>

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


    @if (count(explode('::', $page['component'])) > 1)
        @php
            $module = explode('::', $page['component'])[0];

            $moduleLower = strtolower($module);

            $path = explode('::', $page['component'])[1];
        @endphp
        @vite(['resources/js/app.tsx', "app-modules/$moduleLower/resources/js/pages/$path.tsx"])
    @else
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @endif


    @inertiaHead
</head>

<body class="antialiased">
    @inertia
</body>

</html>
