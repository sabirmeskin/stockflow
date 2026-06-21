<?php

namespace App\Exports;

use App\Models\Stock;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StockExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Stock::with(['item', 'warehouse'])->get();
    }

    public function headings(): array
    {
        return [
            'ID Stock',
            'Entrepôt',
            'SKU',
            'Nom Article',
            'Catégorie',
            'Quantité',
            'Prix Unitaire (MAD)',
            'Valeur Totale (MAD)',
            'Seuil Alerte',
            'Statut Alerte',
        ];
    }

    public function map($stock): array
    {
        $item = $stock->item;
        $price = $item ? $item->price : 0;
        $value = $stock->quantity * $price;
        $threshold = $stock->min_stock_override !== null ? $stock->min_stock_override : ($item ? $item->min_stock : 10);
        $status = $stock->quantity <= $threshold ? 'CRITIQUE' : 'OK';

        return [
            $stock->id,
            $stock->warehouse ? $stock->warehouse->name : 'N/A',
            $item ? $item->sku : 'N/A',
            $item ? $item->name : 'N/A',
            $item ? $item->category : 'N/A',
            $stock->quantity,
            $price,
            $value,
            $threshold,
            $status,
        ];
    }
}
