<?php

declare(strict_types=1);

namespace Modules\Setting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class Setting extends Model
{
    protected $table = 'model_settings'; // Add this line if your migration creates 'model_settings' table

    protected $fillable = ['settable_type', 'settable_id', 'key', 'value', 'type'];

    protected $casts = [
        'value' => 'json',
    ];

    public function morphable(): MorphTo
    {
        return $this->morphTo('settable');
    }

    public function getTypedValueAttribute()
    {
        return match ($this->type) {
            'string' => (string) $this->value,
            'integer' => (int) $this->value,
            'boolean' => (bool) $this->value,
            'float' => (float) $this->value,
            'array' => (array) $this->value,
            default => $this->value,
        };
    }
}
