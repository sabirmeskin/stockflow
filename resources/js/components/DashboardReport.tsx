import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Legend, PieChart, Pie, Cell } from 'recharts';

interface Props {
    stats: {
        total_warehouses: number;
        total_items: number;
        total_stock_value: number;
        pending_movements: number;
        active_alerts: number;
    };
    warehouses_occupancy: Array<{ name: string; current_stock: number; capacity: number; occupancy_rate: number }>;
    recent_movements: Array<{ id: number; type: string; item_name: string; sku: string; source_name: string | null; dest_name: string | null; quantity: number; status: string; created_at: string }>;
    low_stock_list: Array<{ item_name: string; sku: string; warehouse_name: string; quantity: number; threshold: number }>;
    categoryData: Array<{ name: string; value: number }>;
    movementData: Array<{ name: string; value: number }>;
    formatCurrency: (value: number) => string;
}

export interface DashboardReportRef {
    downloadPdf: () => Promise<void>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const MOVEMENT_COLORS = ['#10b981', '#ef4444', '#3b82f6'];

export const DashboardReport = forwardRef<DashboardReportRef, Props>(({
    stats,
    warehouses_occupancy,
    recent_movements,
    low_stock_list,
    categoryData,
    movementData,
    formatCurrency
}, ref) => {
    const reportRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        downloadPdf: async () => {
            const element = reportRef.current;
            if (!element) return;

            try {
                // Unhide the report container temporarily
                element.style.position = 'fixed';
                element.style.left = '0';
                element.style.top = '0';
                element.style.zIndex = '-9999';
                element.style.display = 'block';

                // Wait a tick for the DOM to update and render charts
                await new Promise(resolve => setTimeout(resolve, 500));

                const sections = element.querySelectorAll('.pdf-section');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 15; // 15mm margins on all sides
                const usableWidth = pdfWidth - (margin * 2);
                
                let currentY = margin;

                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i] as HTMLElement;
                    if (section.offsetHeight === 0) continue;

                    // Capture individual section to prevent cutting through text
                    const dataUrl = await htmlToImage.toJpeg(section, { 
                        quality: 1, 
                        backgroundColor: '#ffffff',
                        pixelRatio: 2,
                        skipFonts: true
                    });

                    const imgHeight = (section.offsetHeight * usableWidth) / section.offsetWidth;

                    // If section doesn't fit on current page (and it's not the very top), add new page
                    if (currentY + imgHeight > pageHeight - margin && currentY > margin) {
                        pdf.addPage();
                        currentY = margin;
                    }

                    pdf.addImage(dataUrl, 'JPEG', margin, currentY, usableWidth, imgHeight);
                    
                    // Add an 8mm gap between sections
                    currentY += imgHeight + 8;
                }

                pdf.save(`rapport_dashboard_${new Date().toISOString().slice(0, 10)}.pdf`);
            } catch (error) {
                console.error('Error generating PDF', error);
                throw error; // Rethrow to let parent handle loading state gracefully
            } finally {
                if (element) {
                    element.style.display = 'none';
                    element.style.position = '';
                    element.style.left = '';
                    element.style.top = '';
                }
            }
        }
    }));

    return (
        <div 
            ref={reportRef} 
            style={{ display: 'none', width: '794px', minHeight: '1123px' }} 
            className="bg-white text-black p-10 print-report-container"
        >
            {/* Header */}
            <div className="pdf-section flex justify-between items-start border-b-2 border-neutral-200 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">StockFlow</h1>
                    <p className="text-neutral-500 mt-1">Rapport Complet des Stocks et Entrepôts</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-600">Date d'édition</p>
                    <p className="text-neutral-900">{new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Résumé Exécutif */}
            <div className="pdf-section mb-6">
                <h2 className="text-xl font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-3">1. Résumé Exécutif</h2>
                <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    Ce rapport présente une vue d'ensemble détaillée des opérations logistiques actuelles réparties sur <strong>{stats.total_warehouses} entrepôts</strong>. 
                    La valorisation totale des <strong>{stats.total_items} articles</strong> en stock s'élève à <strong>{formatCurrency(stats.total_stock_value)}</strong>. 
                    À ce jour, le système a enregistré <strong>{stats.pending_movements} mouvements en attente</strong> de validation. 
                    Une attention particulière doit être portée sur les <strong>{stats.active_alerts} alertes critiques de stock</strong> signalées dans ce document, nécessitant un réapprovisionnement immédiat pour éviter toute rupture.
                </p>
            </div>

            {/* Section 1: KPI Summary */}
            <div className="pdf-section mb-8">
                <h2 className="text-xl font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-4">2. Synthèse des KPIs</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <p className="text-sm text-neutral-500">Valeur Totale (MAD)</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.total_stock_value)}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <p className="text-sm text-neutral-500">Articles en Stock</p>
                        <p className="text-2xl font-bold text-neutral-900">{stats.total_items}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <p className="text-sm text-neutral-500">Alertes Critiques</p>
                        <p className="text-2xl font-bold text-rose-600">{stats.active_alerts}</p>
                    </div>
                </div>
            </div>

            {/* Section 2: Charts (Fixed Dimensions for Print) */}
            <div className="pdf-section mb-8">
                <h2 className="text-xl font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-4">3. Occupation des Entrepôts</h2>
                <p className="text-sm text-neutral-600 mb-4">
                    L'analyse visuelle et détaillée ci-dessous illustre la capacité totale disponible comparée au volume de stock actuel pour chaque entrepôt.
                </p>
                <div className="w-full flex justify-center">
                    <BarChart width={700} height={300} data={warehouses_occupancy} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
                        <Bar dataKey="current_stock" name="Stock Actuel" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="capacity" name="Capacité Totale" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                </div>
                
                <div className="mt-6">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="py-2 px-2 font-semibold text-neutral-600">Entrepôt</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600 text-right">Capacité Totale</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600 text-right">Stock Actuel</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600 text-right">Taux d'Occupation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses_occupancy.map((w, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-2 px-2 text-neutral-900 font-medium">{w.name}</td>
                                    <td className="py-2 px-2 text-neutral-700 text-right">{w.capacity}</td>
                                    <td className="py-2 px-2 text-indigo-600 font-semibold text-right">{w.current_stock}</td>
                                    <td className="py-2 px-2 text-neutral-700 text-right">{w.occupancy_rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Distribution par Catégorie */}
            <div className="pdf-section mb-8 page-break-inside-avoid">
                <h2 className="text-xl font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-4">4. Distribution par Catégorie</h2>
                <p className="text-sm text-neutral-600 mb-4">
                    Ce graphique et le tableau associé mettent en évidence la répartition des stocks selon les différentes catégories d'articles.
                </p>
                <div className="flex justify-between items-center gap-8">
                    <div className="w-1/2 flex justify-center">
                        <PieChart width={340} height={250}>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                    </div>
                    <div className="w-1/2">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                    <th className="py-2 px-3 font-semibold text-neutral-600">Catégorie</th>
                                    <th className="py-2 px-3 font-semibold text-neutral-600 text-right">Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryData.map((cat, i) => (
                                    <tr key={i} className="border-b border-neutral-100">
                                        <td className="py-2 px-3 text-neutral-900 font-medium flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                            {cat.name}
                                        </td>
                                        <td className="py-2 px-3 text-neutral-700 font-semibold text-right">{cat.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Section 4: Mouvements du Jour */}
            {recent_movements.length > 0 && (
                <div className="pdf-section mb-8 page-break-inside-avoid">
                    <h2 className="text-xl font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-4">5. Mouvements du Jour</h2>
                    <p className="text-sm text-neutral-600 mb-4">
                        Liste des opérations logistiques les plus récentes effectuées dans le système.
                    </p>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50">
                                <th className="py-2 px-2 font-semibold text-neutral-600">Type</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Article</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Quantité</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Trajet</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_movements.map((mov, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-2 px-2 font-medium">
                                        {mov.type === 'IN' && <span className="text-emerald-600">ENTRÉE</span>}
                                        {mov.type === 'OUT' && <span className="text-rose-600">SORTIE</span>}
                                        {mov.type === 'TRANSFER' && <span className="text-blue-600">TRANSFERT</span>}
                                    </td>
                                    <td className="py-2 px-2 text-neutral-900">{mov.item_name} <span className="text-xs text-neutral-400">({mov.sku})</span></td>
                                    <td className="py-2 px-2 font-bold font-mono text-neutral-700">{mov.quantity}</td>
                                    <td className="py-2 px-2 text-neutral-600 text-xs">
                                        {mov.type === 'IN' && `Vers ${mov.dest_name}`}
                                        {mov.type === 'OUT' && `Depuis ${mov.source_name}`}
                                        {mov.type === 'TRANSFER' && `${mov.source_name} ➔ ${mov.dest_name}`}
                                    </td>
                                    <td className="py-2 px-2 text-neutral-700">
                                        {mov.status === 'validated' && 'Validé'}
                                        {mov.status === 'pending' && 'En attente'}
                                        {mov.status === 'rejected' && 'Rejeté'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Section 5: Alertes Stock */}
            {low_stock_list.length > 0 && (
                <div className="pdf-section mb-8 page-break-inside-avoid">
                    <h2 className="text-xl font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-4">6. Alertes de Stock (Critique)</h2>
                    <p className="text-sm text-neutral-600 mb-4">
                        Les articles suivants ont atteint ou franchi leur seuil minimal d'alerte et nécessitent un réapprovisionnement.
                    </p>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200">
                                <th className="py-2 px-2 font-semibold text-neutral-600">Article</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">SKU</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Entrepôt</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Quantité Actuelle</th>
                                <th className="py-2 px-2 font-semibold text-neutral-600">Seuil Minimal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {low_stock_list.map((alert, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-2 px-2 text-neutral-900">{alert.item_name}</td>
                                    <td className="py-2 px-2 text-neutral-500">{alert.sku}</td>
                                    <td className="py-2 px-2 text-neutral-900">{alert.warehouse_name}</td>
                                    <td className="py-2 px-2 text-rose-600 font-bold">{alert.quantity}</td>
                                    <td className="py-2 px-2 text-neutral-500">{alert.threshold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Signature Block */}
            <div className="pdf-section mt-16 page-break-inside-avoid">
                <div className="flex justify-between w-full px-8">
                    <div className="text-center">
                        <p className="font-bold text-neutral-800 border-t border-neutral-300 pt-2 w-48">Préparé par</p>
                        <p className="text-sm text-neutral-500 mt-1">Responsable Logistique</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-neutral-800 border-t border-neutral-300 pt-2 w-48">Approuvé par</p>
                        <p className="text-sm text-neutral-500 mt-1">Direction</p>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="pdf-section mt-16 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500 flex justify-between">
                <span>StockFlow - Information Confidentielle</span>
                <span>Généré numériquement le {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
        </div>
    );
});

DashboardReport.displayName = 'DashboardReport';
