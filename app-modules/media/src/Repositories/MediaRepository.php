<?php

declare(strict_types=1);

namespace Modules\Media\Repositories;

use Illuminate\Http\UploadedFile;
use Modules\Media\Contracts\MediaRepositoryInterface;
use Plank\Mediable\Facades\MediaUploader as FacadesMediaUploader;
use Plank\Mediable\Media;

final class MediaRepository implements MediaRepositoryInterface
{
    public function upload(UploadedFile $file, string $disk = 'public', ?string $directory = null): Media
    {
        return FacadesMediaUploader::fromSource($file)
            ->toDisk($disk)
            ->toDirectory($directory ?? 'uploads')
            ->upload();
    }
}
