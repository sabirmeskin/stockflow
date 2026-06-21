<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Warehouse;
use App\Models\Item;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Permissions
        $permissions = [
            'manage_users',
            'manage_warehouses',
            'read_warehouses',
            'manage_items',
            'read_items',
            'manage_movements',
            'validate_movements',
            'view_dashboard',
            'manage_alerts',
            'read_alerts',
            'export_reports',
            'configure_system',
            'read_audit_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 2. Create Roles and Assign Permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        $operatorRole = Role::firstOrCreate(['name' => 'operator']);
        $operatorRole->syncPermissions([
            'read_warehouses',
            'manage_items',
            'manage_movements',
            'view_dashboard',
            'manage_alerts',
            'export_reports',
        ]);

        $consultantRole = Role::firstOrCreate(['name' => 'consultant']);
        $consultantRole->syncPermissions([
            'read_warehouses',
            'read_items',
            'view_dashboard',
            'read_alerts',
            'export_reports',
        ]);

        // 3. Create Default Users
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@stockflow.com'],
            [
                'name' => 'Administrateur StockFlow',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $adminUser->syncRoles([$adminRole]);

        $operatorUser = User::firstOrCreate(
            ['email' => 'operator@stockflow.com'],
            [
                'name' => 'Opérateur Terrain Alpha',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $operatorUser->syncRoles([$operatorRole]);

        $operatorUser2 = User::firstOrCreate(
            ['email' => 'operator2@stockflow.com'],
            [
                'name' => 'Opérateur Terrain Bêta',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $operatorUser2->syncRoles([$operatorRole]);

        $operatorUser3 = User::firstOrCreate(
            ['email' => 'operator3@stockflow.com'],
            [
                'name' => 'Ancien Opérateur (Désactivé)',
                'password' => bcrypt('password'),
                'is_active' => false,
            ]
        );
        $operatorUser3->syncRoles([$operatorRole]);

        $consultantUser = User::firstOrCreate(
            ['email' => 'consultant@stockflow.com'],
            [
                'name' => 'Consultant Logistique Principal',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $consultantUser->syncRoles([$consultantRole]);

        $consultantUser2 = User::firstOrCreate(
            ['email' => 'consultant2@stockflow.com'],
            [
                'name' => 'Auditeur Externe',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $consultantUser2->syncRoles([$consultantRole]);

        // 4. Create Warehouses
        $w1 = Warehouse::firstOrCreate(
            ['name' => 'Entrepôt Alpha'],
            ['address' => '12 Rue de l\'Europe, Paris', 'capacity' => 500]
        );

        $w2 = Warehouse::firstOrCreate(
            ['name' => 'Entrepôt Bêta'],
            ['address' => '45 Avenue des Champs, Lyon', 'capacity' => 1000]
        );

        $w3 = Warehouse::firstOrCreate(
            ['name' => 'Entrepôt Gamma'],
            ['address' => 'Zone Industrielle Nord, Marseille', 'capacity' => 2000]
        );

        $w4 = Warehouse::firstOrCreate(
            ['name' => 'Entrepôt Delta'],
            ['address' => '78 Boulevard de l\'Est, Strasbourg', 'capacity' => 800]
        );

        $w5 = Warehouse::firstOrCreate(
            ['name' => 'Entrepôt Epsilon'],
            ['address' => '5 Route de l\'Ouest, Nantes', 'capacity' => 600]
        );

        // 5. Create Items
        $itemsData = [
            [
                'sku' => 'EL-LAP-001',
                'name' => 'Ordinateur Portable Pro',
                'description' => 'Laptop professionnel 16GB RAM, SSD 512GB',
                'category' => 'Électronique',
                'price' => 1200.00,
                'min_stock' => 15,
            ],
            [
                'sku' => 'EL-MON-002',
                'name' => 'Écran 27 Pouces 4K',
                'description' => 'Écran ergonomique IPS haute résolution',
                'category' => 'Électronique',
                'price' => 350.00,
                'min_stock' => 10,
            ],
            [
                'sku' => 'OU-PER-003',
                'name' => 'Perceuse Sans Fil 18V',
                'description' => 'Perceuse visseuse avec 2 batteries lithium-ion',
                'category' => 'Outillage',
                'price' => 89.90,
                'min_stock' => 5,
            ],
            [
                'sku' => 'FO-RAM-004',
                'name' => 'Rame de papier A4 80g',
                'description' => 'Papier blanc d\'imprimante recyclé, lot de 5 rames',
                'category' => 'Fournitures',
                'price' => 24.50,
                'min_stock' => 40,
            ],
            [
                'sku' => 'FO-STY-005',
                'name' => 'Stylos à bille bleus (boîte de 50)',
                'description' => 'Stylos à pointe moyenne écriture fluide',
                'category' => 'Fournitures',
                'price' => 8.99,
                'min_stock' => 10,
            ],
            [
                'sku' => 'EL-KEY-006',
                'name' => 'Clavier Mécanique RGB',
                'description' => 'Clavier mécanique pour développeur, switchs tactiles silencieux',
                'category' => 'Électronique',
                'price' => 79.99,
                'min_stock' => 12,
            ],
            [
                'sku' => 'EL-MOU-007',
                'name' => 'Souris Ergonomique Sans Fil',
                'description' => 'Souris ergonomique rechargeable avec défilement ultra-rapide',
                'category' => 'Électronique',
                'price' => 45.50,
                'min_stock' => 15,
            ],
            [
                'sku' => 'OU-SCI-008',
                'name' => 'Scie Circulaire 1200W',
                'description' => 'Scie circulaire compacte avec guidage laser de précision',
                'category' => 'Outillage',
                'price' => 129.00,
                'min_stock' => 4,
            ],
            [
                'sku' => 'OU-CAF-009',
                'name' => 'Cafetière de Chantier Robust',
                'description' => 'Machine à café antichoc et résistante aux projections d\'eau',
                'category' => 'Outillage',
                'price' => 149.99,
                'min_stock' => 3,
            ],
            [
                'sku' => 'FO-CLA-010',
                'name' => 'Classeurs à levier A4 (lot de 10)',
                'description' => 'Classeurs dos 7.5cm en carton rigide pelliculé',
                'category' => 'Fournitures',
                'price' => 18.50,
                'min_stock' => 25,
            ],
            [
                'sku' => 'FO-ENF-011',
                'name' => 'Enveloppes Kraft (boîte de 250)',
                'description' => 'Pochettes kraft unies autocollantes grand format C4',
                'category' => 'Fournitures',
                'price' => 12.90,
                'min_stock' => 15,
            ],
            [
                'sku' => 'EL-CHA-012',
                'name' => 'Chargeur Rapide USB-C 65W',
                'description' => 'Adaptateur secteur compact multi-ports GaN',
                'category' => 'Électronique',
                'price' => 29.99,
                'min_stock' => 20,
            ],
            [
                'sku' => 'EL-CAS-013',
                'name' => 'Casque Réduction de Bruit',
                'description' => 'Casque sans fil circum-aural avec réduction active hybride',
                'category' => 'Électronique',
                'price' => 199.00,
                'min_stock' => 8,
            ],
            [
                'sku' => 'OU-BOI-014',
                'name' => 'Boîte à Outils Professionnelle',
                'description' => 'Valise d\'outils complète de 150 pièces en acier chrome-vanadium',
                'category' => 'Outillage',
                'price' => 95.00,
                'min_stock' => 6,
            ],
            [
                'sku' => 'FO-AGR-015',
                'name' => 'Agrafeuse Métallique Heavy-Duty',
                'description' => 'Agrafeuse de bureau à grande capacité de reliure (jusqu\'à 40 feuilles)',
                'category' => 'Fournitures',
                'price' => 14.20,
                'min_stock' => 10,
            ],
        ];

        $items = [];
        foreach ($itemsData as $data) {
            $items[] = Item::firstOrCreate(['sku' => $data['sku']], $data);
        }

        // 6. Setup Initial Stock
        // Alpha (Capacity: 500)
        Stock::updateOrCreate(['warehouse_id' => $w1->id, 'item_id' => $items[0]->id], ['quantity' => 25]);
        Stock::updateOrCreate(['warehouse_id' => $w1->id, 'item_id' => $items[1]->id], ['quantity' => 8]); // low stock (8 < 10)
        Stock::updateOrCreate(['warehouse_id' => $w1->id, 'item_id' => $items[5]->id], ['quantity' => 30]);
        Stock::updateOrCreate(['warehouse_id' => $w1->id, 'item_id' => $items[11]->id], ['quantity' => 18]); // low stock (18 < 20)

        // Bêta (Capacity: 1000)
        Stock::updateOrCreate(['warehouse_id' => $w2->id, 'item_id' => $items[2]->id], ['quantity' => 4]); // low stock (4 < 5)
        Stock::updateOrCreate(['warehouse_id' => $w2->id, 'item_id' => $items[3]->id], ['quantity' => 150]);
        Stock::updateOrCreate(['warehouse_id' => $w2->id, 'item_id' => $items[6]->id], ['quantity' => 45]);
        Stock::updateOrCreate(['warehouse_id' => $w2->id, 'item_id' => $items[7]->id], ['quantity' => 3]); // low stock (3 < 4)
        Stock::updateOrCreate(['warehouse_id' => $w2->id, 'item_id' => $items[12]->id], ['quantity' => 12]);

        // Gamma (Capacity: 2000)
        Stock::updateOrCreate(['warehouse_id' => $w3->id, 'item_id' => $items[0]->id], ['quantity' => 75]);
        Stock::updateOrCreate(['warehouse_id' => $w3->id, 'item_id' => $items[4]->id], ['quantity' => 5]); // low stock (5 < 10)
        Stock::updateOrCreate(['warehouse_id' => $w3->id, 'item_id' => $items[9]->id], ['quantity' => 200]);
        Stock::updateOrCreate(['warehouse_id' => $w3->id, 'item_id' => $items[13]->id], ['quantity' => 14]);

        // Delta (Capacity: 800)
        Stock::updateOrCreate(['warehouse_id' => $w4->id, 'item_id' => $items[1]->id], ['quantity' => 40]);
        Stock::updateOrCreate(['warehouse_id' => $w4->id, 'item_id' => $items[8]->id], ['quantity' => 2]); // low stock (2 < 3)
        Stock::updateOrCreate(['warehouse_id' => $w4->id, 'item_id' => $items[10]->id], ['quantity' => 18]);
        Stock::updateOrCreate(['warehouse_id' => $w4->id, 'item_id' => $items[14]->id], ['quantity' => 35]);

        // Epsilon (Capacity: 600)
        Stock::updateOrCreate(['warehouse_id' => $w5->id, 'item_id' => $items[2]->id], ['quantity' => 15]);
        Stock::updateOrCreate(['warehouse_id' => $w5->id, 'item_id' => $items[3]->id], ['quantity' => 80]);
        Stock::updateOrCreate(['warehouse_id' => $w5->id, 'item_id' => $items[5]->id], ['quantity' => 5]); // low stock (5 < 12)
        Stock::updateOrCreate(['warehouse_id' => $w5->id, 'item_id' => $items[6]->id], ['quantity' => 22]);

        // Custom alert override examples
        // Let's set a custom alert override for perceuses in Epsilon (override to 20 units)
        Stock::where('warehouse_id', $w5->id)->where('item_id', $items[2]->id)->update(['min_stock_override' => 20]); // Now in low stock since 15 < 20

        // 7. Seed Movements History
        $now = Carbon::now();

        // Let's construct a list of historical movements
        $movementsData = [
            // Validated Movements (stocks already applied)
            [
                'type' => 'IN',
                'item_id' => $items[0]->id,
                'destination_warehouse_id' => $w1->id,
                'quantity' => 10,
                'created_by' => $operatorUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(10)->subHours(2),
            ],
            [
                'type' => 'IN',
                'item_id' => $items[3]->id,
                'destination_warehouse_id' => $w2->id,
                'quantity' => 100,
                'created_by' => $operatorUser2->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(8)->subHours(4),
            ],
            [
                'type' => 'OUT',
                'item_id' => $items[1]->id,
                'source_warehouse_id' => $w1->id,
                'quantity' => 2,
                'created_by' => $operatorUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(7)->subHours(1),
            ],
            [
                'type' => 'TRANSFER',
                'item_id' => $items[0]->id,
                'source_warehouse_id' => $w3->id,
                'destination_warehouse_id' => $w1->id,
                'quantity' => 5,
                'created_by' => $operatorUser2->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(6)->subHours(5),
            ],
            [
                'type' => 'IN',
                'item_id' => $items[9]->id,
                'destination_warehouse_id' => $w3->id,
                'quantity' => 50,
                'created_by' => $adminUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(5)->subHours(3),
            ],
            [
                'type' => 'OUT',
                'item_id' => $items[5]->id,
                'source_warehouse_id' => $w5->id,
                'quantity' => 10,
                'created_by' => $operatorUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(4)->subHours(6),
            ],
            [
                'type' => 'IN',
                'item_id' => $items[6]->id,
                'destination_warehouse_id' => $w2->id,
                'quantity' => 25,
                'created_by' => $operatorUser2->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(3)->subHours(2),
            ],
            [
                'type' => 'TRANSFER',
                'item_id' => $items[2]->id,
                'source_warehouse_id' => $w5->id,
                'destination_warehouse_id' => $w2->id,
                'quantity' => 5,
                'created_by' => $operatorUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'validated',
                'created_at' => $now->copy()->subDays(2)->subHours(1),
            ],

            // Rejected Movements (Motif de rejet requis)
            [
                'type' => 'OUT',
                'item_id' => $items[0]->id,
                'source_warehouse_id' => $w1->id,
                'quantity' => 100, // Insufficient stock
                'created_by' => $operatorUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'rejected',
                'rejection_reason' => 'Stock disponible insuffisant sur le site (Seulement 25 U restants).',
                'created_at' => $now->copy()->subDays(9)->subHours(1),
            ],
            [
                'type' => 'TRANSFER',
                'item_id' => $items[7]->id,
                'source_warehouse_id' => $w2->id,
                'destination_warehouse_id' => $w1->id,
                'quantity' => 8,
                'created_by' => $operatorUser2->id,
                'validated_by' => $adminUser->id,
                'status' => 'rejected',
                'rejection_reason' => 'Erreur de saisie opérateur : article non requis dans l\'entrepôt Alpha.',
                'created_at' => $now->copy()->subDays(5)->subHours(8),
            ],
            [
                'type' => 'OUT',
                'item_id' => $items[12]->id,
                'source_warehouse_id' => $w2->id,
                'quantity' => 30,
                'created_by' => $operatorUser->id,
                'validated_by' => $adminUser->id,
                'status' => 'rejected',
                'rejection_reason' => 'Annulation par la logistique, commande client modifiée.',
                'created_at' => $now->copy()->subDays(3)->subHours(10),
            ],

            // Pending Movements (Approbations en attente - à afficher sur la page /validations)
            [
                'type' => 'IN',
                'item_id' => $items[12]->id,
                'destination_warehouse_id' => $w2->id,
                'quantity' => 15,
                'created_by' => $operatorUser->id,
                'validated_by' => null,
                'status' => 'pending',
                'created_at' => $now->copy()->subDays(1)->subHours(4),
            ],
            [
                'type' => 'OUT',
                'item_id' => $items[13]->id,
                'source_warehouse_id' => $w3->id,
                'quantity' => 4,
                'created_by' => $operatorUser2->id,
                'validated_by' => null,
                'status' => 'pending',
                'created_at' => $now->copy()->subHours(20),
            ],
            [
                'type' => 'TRANSFER',
                'item_id' => $items[5]->id,
                'source_warehouse_id' => $w1->id,
                'destination_warehouse_id' => $w5->id,
                'quantity' => 10,
                'created_by' => $operatorUser->id,
                'validated_by' => null,
                'status' => 'pending',
                'created_at' => $now->copy()->subHours(15),
            ],
            [
                'type' => 'IN',
                'item_id' => $items[8]->id,
                'destination_warehouse_id' => $w4->id,
                'quantity' => 20,
                'created_by' => $operatorUser2->id,
                'validated_by' => null,
                'status' => 'pending',
                'created_at' => $now->copy()->subHours(8),
            ],
            [
                'type' => 'OUT',
                'item_id' => $items[14]->id,
                'source_warehouse_id' => $w4->id,
                'quantity' => 12,
                'created_by' => $operatorUser->id,
                'validated_by' => null,
                'status' => 'pending',
                'created_at' => $now->copy()->subHours(4),
            ],
            [
                'type' => 'TRANSFER',
                'item_id' => $items[10]->id,
                'source_warehouse_id' => $w4->id,
                'destination_warehouse_id' => $w5->id,
                'quantity' => 5,
                'created_by' => $operatorUser2->id,
                'validated_by' => null,
                'status' => 'pending',
                'created_at' => $now->copy()->subHours(1),
            ],
        ];

        foreach ($movementsData as $movData) {
            StockMovement::create($movData);
        }

        // 8. System Settings
        SystemSetting::set('company_name', 'StockFlow Logistics');
        SystemSetting::set('company_address', '100 Boulevard de la Logistique, Paris, France');
        SystemSetting::set('company_phone', '+33 1 23 45 67 89');
        SystemSetting::set('company_email', 'contact@stockflow-logistics.com');
        SystemSetting::set('currency', 'EUR');
    }
}
