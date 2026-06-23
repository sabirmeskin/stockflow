<?php

namespace App\Events;

use App\Models\Item;
use App\Models\Warehouse;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RuptureStockEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(
        public Item $item,
        public Warehouse $warehouse,
        public array $recipientIds,
    ) {
        $this->data = [
            'type' => 'rupture_stock',
            'title' => 'Rupture de stock',
            'message' => "L'article {$item->name} ({$item->sku}) est en rupture de stock dans {$warehouse->name}",
            'item_name' => $item->name,
            'sku' => $item->sku,
            'warehouse_name' => $warehouse->name,
            'quantity' => 0,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return collect($this->recipientIds)
            ->map(fn (int $id) => new PrivateChannel("App.Models.User.{$id}"))
            ->all();
    }

    public function broadcastAs(): string
    {
        return 'stock.notification';
    }
}
