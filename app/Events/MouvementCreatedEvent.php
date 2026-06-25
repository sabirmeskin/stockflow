<?php

namespace App\Events;

use App\Models\StockMovement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MouvementCreatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(
        public StockMovement $movement,
        public array $recipientIds,
    ) {
        $this->data = [
            'type' => 'mouvement_created',
            'title' => 'Nouveau mouvement',
            'message' => "Mouvement {$movement->type} de {$movement->quantity} unités créé par {$movement->creator->name}",
            'movement_id' => $movement->id,
            'movement_type' => $movement->type,
            'item_name' => $movement->item->name ?? 'N/A',
            'quantity' => $movement->quantity,
            'status' => $movement->status,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
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
