<?php

namespace App\Http\Controllers;

use App\Exports\MovementExport;
use App\Exports\StockExport;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\SystemSetting;
use App\Services\AuditLogger;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function exportStockExcel()
    {
        Gate::authorize('export_reports');
        AuditLogger::log('EXPORT_EXCEL_STOCK', 'Export Excel de l\'état des stocks');

        return Excel::download(new StockExport, 'stocks_'.date('Ymd_His').'.xlsx');
    }

    public function exportMovementExcel()
    {
        Gate::authorize('export_reports');
        AuditLogger::log('EXPORT_EXCEL_MOVEMENTS', 'Export Excel de l\'historique des mouvements');

        return Excel::download(new MovementExport, 'movements_'.date('Ymd_His').'.xlsx');
    }

    public function exportStockPdf()
    {
        Gate::authorize('export_reports');

        $stocks = Stock::with(['item', 'warehouse'])->get();
        $companyName = SystemSetting::get('company_name', 'StockFlow Logistics');
        $companyAddress = SystemSetting::get('company_address', '');
        $companyEmail = SystemSetting::get('company_email', '');

        $pdf = Pdf::loadView('reports.stocks', [
            'stocks' => $stocks,
            'company_name' => $companyName,
            'company_address' => $companyAddress,
            'company_email' => $companyEmail,
        ]);

        AuditLogger::log('EXPORT_PDF_STOCK', 'Export PDF de l\'état des stocks');

        return $pdf->download('rapport_stocks_'.date('Ymd_His').'.pdf');
    }

    public function exportMovementPdf()
    {
        Gate::authorize('export_reports');

        $movements = StockMovement::with(['item', 'sourceWarehouse', 'destinationWarehouse', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        $companyName = SystemSetting::get('company_name', 'StockFlow Logistics');
        $companyAddress = SystemSetting::get('company_address', '');
        $companyEmail = SystemSetting::get('company_email', '');

        $pdf = Pdf::loadView('reports.movements', [
            'movements' => $movements,
            'company_name' => $companyName,
            'company_address' => $companyAddress,
            'company_email' => $companyEmail,
        ]);

        AuditLogger::log('EXPORT_PDF_MOVEMENTS', 'Export PDF de l\'historique des mouvements');

        return $pdf->download('rapport_mouvements_'.date('Ymd_His').'.pdf');
    }
}
