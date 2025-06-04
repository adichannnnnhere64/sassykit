<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Build CSP directives
        $directives = [
            "default-src 'self'",
            "script-src 'self' https://pagead2.googlesyndication.com https://analytics.761073128.xyz https://ep2.adtrafficquality.google https://maps.googleapis.com https://js.stripe.com 'unsafe-inline' 'unsafe-eval'",
            "script-src-elem 'self' https://pagead2.googlesyndication.com https://analytics.761073128.xyz https://ep2.adtrafficquality.google https://maps.googleapis.com https://js.stripe.com 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: https://maps.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "frame-src 'self' https://js.stripe.com https://*.stripe.com https://hooks.stripe.com https://m.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com/recaptcha",
            "connect-src 'self' https://analytics.761073128.xyz https://ep1.adtrafficquality.google https://maps.googleapis.com https://js.stripe.com https://api.stripe.com https://m.stripe.com https://*.stripe.com",
        ];

        // Combine directives into single header
        $csp = implode('; ', $directives) . ';';

        if (app()->isLocal()) {
            $csp = '';
        }

        // Set headers - multiple methods for maximum compatibility
        $response->headers->set('Content-Security-Policy', $csp, true);
        $response->headers->set('X-Content-Security-Policy', $csp, true); // For IE support

        return $response;
    }
}
