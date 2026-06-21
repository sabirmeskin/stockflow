<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historique des Mouvements</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.4; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #065f46; }
        .title { font-size: 20px; text-transform: uppercase; margin-top: 10px; color: #475569; }
        .company-details { float: right; text-align: right; font-size: 12px; color: #64748b; }
        .date { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: bold; color: #334155; }
        td { border: 1px solid #e2e8f0; padding: 8px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .badge-pending { background-color: #fef3c7; color: #92400e; }
        .badge-validated { background-color: #dcfce7; color: #166534; }
        .badge-rejected { background-color: #fee2e2; color: #991b1b; }
        .type-in { color: #166534; font-weight: bold; }
        .type-out { color: #991b1b; font-weight: bold; }
        .type-transfer { color: #1e40af; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-details">
            <strong>{{ $company_name }}</strong><br>
            {{ $company_address }}<br>
            Email: {{ $company_email }}
        </div>
        <div class="logo">StockFlow</div>
        <div class="title">Rapport des Mouvements de Stock</div>
        <div class="date">Généré le : {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>SKU</th>
                <th>Article</th>
                <th>Quantité</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Créé Par</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @php
                $typeLabels = ['IN' => 'Entrée', 'OUT' => 'Sortie', 'TRANSFER' => 'Transfert'];
                $statusLabels = ['pending' => 'En attente', 'validated' => 'Validé', 'rejected' => 'Rejeté'];
            @endphp
            @foreach($movements as $mov)
                <tr>
                    <td>{{ $mov->created_at->format('d/m/Y H:i') }}</td>
                    <td>
                        <span class="type-{{ strtolower($mov->type) }}">{{ $typeLabels[$mov->type] ?? $mov->type }}</span>
                    </td>
                    <td><strong>{{ $mov->item ? $mov->item->sku : 'N/A' }}</strong></td>
                    <td>{{ $mov->item ? $mov->item->name : 'N/A' }}</td>
                    <td>{{ $mov->quantity }}</td>
                    <td>{{ $mov->sourceWarehouse ? $mov->sourceWarehouse->name : '-' }}</td>
                    <td>{{ $mov->destinationWarehouse ? $mov->destinationWarehouse->name : '-' }}</td>
                    <td>{{ $mov->creator ? $mov->creator->name : 'Système' }}</td>
                    <td>
                        <span class="badge badge-{{ $mov->status }}">{{ $statusLabels[$mov->status] ?? $mov->status }}</span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        StockFlow Logistique &copy; {{ date('Y') }} - Rapport de mouvements de stock
    </div>
</body>
</html>
