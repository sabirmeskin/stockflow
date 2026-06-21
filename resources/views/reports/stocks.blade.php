<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport de Stock</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.4; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
        .title { font-size: 20px; text-transform: uppercase; margin-top: 10px; color: #475569; }
        .company-details { float: right; text-align: right; font-size: 12px; color: #64748b; }
        .date { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: bold; color: #334155; }
        td { border: 1px solid #e2e8f0; padding: 8px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .badge-danger { background-color: #fee2e2; color: #991b1b; }
        .badge-success { background-color: #dcfce7; color: #166534; }
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
        <div class="title">Rapport d'État des Stocks</div>
        <div class="date">Généré le : {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Entrepôt</th>
                <th>SKU</th>
                <th>Article</th>
                <th>Catégorie</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Valeur Totale</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stocks as $stock)
                @php
                    $item = $stock->item;
                    $threshold = $stock->min_stock_override !== null ? $stock->min_stock_override : ($item ? $item->min_stock : 10);
                    $isLow = $stock->quantity <= $threshold;
                @endphp
                <tr>
                    <td>{{ $stock->warehouse ? $stock->warehouse->name : 'N/A' }}</td>
                    <td><strong>{{ $item ? $item->sku : 'N/A' }}</strong></td>
                    <td>{{ $item ? $item->name : 'N/A' }}</td>
                    <td>{{ $item ? $item->category : 'N/A' }}</td>
                    <td>{{ $stock->quantity }}</td>
                    <td>{{ number_format($item ? $item->price : 0, 2) }} DH</td>
                    <td>{{ number_format($stock->quantity * ($item ? $item->price : 0), 2) }} DH</td>
                    <td>
                        @if($isLow)
                            <span class="badge badge-danger">Critique</span>
                        @else
                            <span class="badge badge-success">Correct</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        StockFlow Logistique &copy; {{ date('Y') }} - Rapport confidentiel généré automatiquement
    </div>
</body>
</html>
