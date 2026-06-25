<?php

namespace App\Events;

use App\Models\Item;
use App\Models\Warehouse;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FaibleStockEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(
        public Item $item,
        public Warehouse $warehouse,
        public int $currentQuantity,
        public int $threshold,
        public array $recipientIds,
    ) {
        $this->data = [
            'type' => 'faible_stock',
            'title' => 'Stock faible',
            'message' => "L'article {$item->name} ({$item->sku}) est sous le seuil dans {$warehouse->name} ({$currentQuantity}/{$threshold})",
            'item_name' => $item->name,
            'sku' => $item->sku,
            'warehouse_name' => $warehouse->name,
            'quantity' => $currentQuantity,
            'threshold' => $threshold,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * @return array<int, Channel>
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
