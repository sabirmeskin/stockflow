<?php

namespace App\Events;

use App\Models\StockMovement;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MouvementRejectedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(
        public StockMovement $movement,
    ) {
        $this->data = [
            'type' => 'mouvement_rejected',
            'title' => 'Mouvement rejeté',
            'message' => "Votre mouvement {$movement->type} de {$movement->quantity} unités pour {$movement->item->name} a été rejeté" .
                ($movement->rejection_reason ? " — Raison : {$movement->rejection_reason}" : ''),
            'movement_id' => $movement->id,
            'movement_type' => $movement->type,
            'item_name' => $movement->item->name ?? 'N/A',
            'quantity' => $movement->quantity,
            'rejection_reason' => $movement->rejection_reason,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * Broadcast only to the operator who created the movement.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$this->movement->created_by}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.notification';
    }
}
