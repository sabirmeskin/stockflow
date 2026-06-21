<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Warehouse;
use App\Models\Item;
use App\Models\Stock;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

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
            ]
        );
        $adminUser->syncRoles([$adminRole]);

        $operatorUser = User::firstOrCreate(
            ['email' => 'operator@stockflow.com'],
            [
                'name' => 'Opérateur Terrain',
                'password' => bcrypt('password'),
            ]
        );
        $operatorUser->syncRoles([$operatorRole]);

        $consultantUser = User::firstOrCreate(
            ['email' => 'consultant@stockflow.com'],
            [
                'name' => 'Consultant Logistique',
                'password' => bcrypt('password'),
            ]
        );
        $consultantUser->syncRoles([$consultantRole]);

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
            ]
        ];

        $items = [];
        foreach ($itemsData as $data) {
            $items[] = Item::firstOrCreate(['sku' => $data['sku']], $data);
        }

        // 6. Setup Initial Stock
        // Alpha has some items
        Stock::firstOrCreate(
            ['warehouse_id' => $w1->id, 'item_id' => $items[0]->id],
            ['quantity' => 20]
        );
        Stock::firstOrCreate(
            ['warehouse_id' => $w1->id, 'item_id' => $items[1]->id],
            ['quantity' => 8] // low stock warning: 8 < 10
        );

        // Bêta has some items
        Stock::firstOrCreate(
            ['warehouse_id' => $w2->id, 'item_id' => $items[2]->id],
            ['quantity' => 4] // low stock warning: 4 < 5
        );
        Stock::firstOrCreate(
            ['warehouse_id' => $w2->id, 'item_id' => $items[3]->id],
            ['quantity' => 120]
        );

        // Gamma has some items
        Stock::firstOrCreate(
            ['warehouse_id' => $w3->id, 'item_id' => $items[0]->id],
            ['quantity' => 50]
        );
        Stock::firstOrCreate(
            ['warehouse_id' => $w3->id, 'item_id' => $items[4]->id],
            ['quantity' => 5] // low stock warning: 5 < 10
        );

        // 7. System Settings
        SystemSetting::set('company_name', 'StockFlow Logistics');
        SystemSetting::set('company_address', '100 Boulevard de la Logistique, Paris, France');
        SystemSetting::set('company_phone', '+33 1 23 45 67 89');
        SystemSetting::set('company_email', 'contact@stockflow-logistics.com');
        SystemSetting::set('currency', 'EUR');
    }
}
