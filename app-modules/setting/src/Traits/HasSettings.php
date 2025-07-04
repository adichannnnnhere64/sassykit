<?php

namespace Modules\Setting\Traits;

use Modules\Setting\Models\Setting; // Updated to use your model
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Modules\Setting\Services\SettingService;

trait HasSettings
{
    public function settings(): MorphMany
    {
        return $this->morphMany(Setting::class, 'settable');
    }

    public function getSetting(string $key, mixed $default = null): mixed
    {
        return app(SettingService::class)->get($this, $key, $default);
    }

    public function setSetting(string $key, mixed $value, string $type = null): void
    {
        app(SettingService::class)->set($this, $key, $value, $type);
    }

    public function hasSetting(string $key): bool
    {
        return app(SettingService::class)->has($this, $key);
    }

    public function forgetSetting(string $key): void
    {
        app(SettingService::class)->forget($this, $key);
    }

    public function getAllSettings(): array
    {
        return app(SettingService::class)->all($this);
    }

    public function setManySettings(array $settings): void
    {
        app(SettingService::class)->setMany($this, $settings);
    }

    public function flushSettings(): void
    {
        app(SettingService::class)->flush($this);
    }

    public function copySettingsFrom(object $model, array $keys = null): void
    {
        app(SettingService::class)->copy($model, $this, $keys);
    }

    public function copySettingsTo(object $model, array $keys = null): void
    {
        app(SettingService::class)->copy($this, $model, $keys);
    }
}
