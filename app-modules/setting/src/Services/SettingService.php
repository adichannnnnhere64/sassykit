<?php

namespace Modules\Setting\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;
use Modules\Setting\Models\Setting;

class SettingService
{
    private const CACHE_PREFIX = 'model_settings:';
    private const CACHE_TTL = 3600;

    private array $allowedTypes = ['string', 'integer', 'boolean', 'float', 'array'];

    public function get(Model $model, string $key, mixed $default = null): mixed
    {
        $settings = $this->getAllSettings($model);

        if (!isset($settings[$key])) {
            return $default;
        }

        return $this->castValue($settings[$key]['value'], $settings[$key]['type']);
    }

    public function set(Model $model, string $key, mixed $value, string $type = null): void
    {
        if ($type === null) {
            $type = $this->inferType($value);
        }

        $this->validateType($type);
        $this->validateValue($value, $type);

        Setting::updateOrCreate(
            [
                'settable_type' => get_class($model),
                'settable_id' => $model->getKey(),
                'key' => $key
            ],
            ['value' => $value, 'type' => $type]
        );

        $this->clearCache($model);
    }

    public function has(Model $model, string $key): bool
    {
        $settings = $this->getAllSettings($model);
        return isset($settings[$key]);
    }

    public function forget(Model $model, string $key): void
    {
        Setting::where('settable_type', get_class($model))
                   ->where('settable_id', $model->getKey())
                   ->where('key', $key)
                   ->delete();

        $this->clearCache($model);
    }

    public function all(Model $model): array
    {
        $settings = $this->getAllSettings($model);
        $result = [];

        foreach ($settings as $key => $data) {
            $result[$key] = $this->castValue($data['value'], $data['type']);
        }

        return $result;
    }

    public function setMany(Model $model, array $settings): void
    {
        foreach ($settings as $key => $data) {
            if (is_array($data) && isset($data['value'], $data['type'])) {
                $this->set($model, $key, $data['value'], $data['type']);
            } else {
                $this->set($model, $key, $data);
            }
        }
    }

    public function flush(Model $model): void
    {
        Setting::where('settable_type', get_class($model))
                   ->where('settable_id', $model->getKey())
                   ->delete();

        $this->clearCache($model);
    }

    public function copy(Model $fromModel, Model $toModel, array $keys = null): void
    {
        $query = Setting::where('settable_type', get_class($fromModel))
                            ->where('settable_id', $fromModel->getKey());

        if ($keys !== null) {
            $query->whereIn('key', $keys);
        }

        $settings = $query->get();

        foreach ($settings as $setting) {
            $this->set($toModel, $setting->key, $setting->value, $setting->type);
        }
    }

    private function getAllSettings(Model $model): array
    {
        $cacheKey = $this->getCacheKey($model);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($model) {
            return Setting::where('settable_type', get_class($model))
                              ->where('settable_id', $model->getKey())
                              ->get()
                              ->keyBy('key')
                              ->map(fn($setting) => [
                                  'value' => $setting->value,
                                  'type' => $setting->type
                              ])
                              ->toArray();
        });
    }

    private function getCacheKey(Model $model): string
    {
        return self::CACHE_PREFIX . get_class($model) . ':' . $model->getKey();
    }

    private function clearCache(Model $model): void
    {
        Cache::forget($this->getCacheKey($model));
    }

    private function inferType(mixed $value): string
    {
        return match (true) {
            is_bool($value) => 'boolean',
            is_int($value) => 'integer',
            is_float($value) => 'float',
            is_array($value) => 'array',
            default => 'string',
        };
    }

    private function validateType(string $type): void
    {
        if (!in_array($type, $this->allowedTypes)) {
            throw new InvalidArgumentException("Invalid type: {$type}");
        }
    }

    private function validateValue(mixed $value, string $type): void
    {
        $isValid = match ($type) {
            'string' => is_string($value) || is_scalar($value),
            'integer' => is_int($value) || (is_numeric($value) && intval($value) == $value),
            'boolean' => is_bool($value) || in_array($value, [0, 1, '0', '1', 'true', 'false']),
            'float' => is_float($value) || is_numeric($value),
            'array' => is_array($value),
            default => true,
        };

        if (!$isValid) {
            throw new InvalidArgumentException("Value type mismatch for type: {$type}");
        }
    }

    private function castValue(mixed $value, string $type): mixed
    {
        return match ($type) {
            'string' => (string) $value,
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'float' => (float) $value,
            'array' => (array) $value,
            default => $value,
        };
    }
}
