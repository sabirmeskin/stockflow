<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category',
        'price',
        'min_stock',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'min_stock' => 'integer',
    ];

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }
}
