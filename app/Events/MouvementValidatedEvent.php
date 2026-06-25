<?php

namespace App\Events;

use App\Models\StockMovement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MouvementValidatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(
        public StockMovement $movement,
    ) {
        $this->data = [
            'type' => 'mouvement_validated',
            'title' => 'Mouvement validé',
            'message' => "Votre mouvement {$movement->type} de {$movement->quantity} unités pour {$movement->item->name} a été validé",
            'movement_id' => $movement->id,
            'movement_type' => $movement->type,
            'item_name' => $movement->item->name ?? 'N/A',
            'quantity' => $movement->quantity,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * Broadcast only to the operator who created the movement.
     *
     * @return array<int, Channel>
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
