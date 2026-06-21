<?php

namespace App\Exports;

use App\Models\StockMovement;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MovementExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return StockMovement::with(['item', 'sourceWarehouse', 'destinationWarehouse', 'creator', 'validator'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID Mouvement',
            'Date',
            'Type',
            'SKU Article',
            'Nom Article',
            'Quantité',
            'Entrepôt Source',
            'Entrepôt Destination',
            'Créé Par',
            'Validé Par',
            'Statut',
            'Raison de Rejet',
        ];
    }

    public function map($mov): array
    {
        $typeLabels = ['IN' => 'Entrée', 'OUT' => 'Sortie', 'TRANSFER' => 'Transfert'];
        $statusLabels = ['pending' => 'En attente', 'validated' => 'Validé', 'rejected' => 'Rejeté'];

        return [
            $mov->id,
            $mov->created_at->format('d/m/Y H:i'),
            $typeLabels[$mov->type] ?? $mov->type,
            $mov->item ? $mov->item->sku : 'N/A',
            $mov->item ? $mov->item->name : 'N/A',
            $mov->quantity,
            $mov->sourceWarehouse ? $mov->sourceWarehouse->name : 'N/A',
            $mov->destinationWarehouse ? $mov->destinationWarehouse->name : 'N/A',
            $mov->creator ? $mov->creator->name : 'Système',
            $mov->validator ? $mov->validator->name : 'N/A',
            $statusLabels[$mov->status] ?? $mov->status,
            $mov->rejection_reason ?: '',
        ];
    }
}
