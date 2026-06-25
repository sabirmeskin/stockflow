<?php

use App\Models\Item;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed();
    $this->admin = User::where('email', 'admin@stockflow.com')->first();
    $this->operator = User::where('email', 'operator@stockflow.com')->first();
});

test('admin can toggle user status', function () {
    $this->actingAs($this->admin);

    expect($this->operator->is_active)->toBeTrue();

    // Toggle to false
    $response = $this->post(route('users.toggle-status', $this->operator));
    $response->assertRedirect();

    $this->operator->refresh();
    expect($this->operator->is_active)->toBeFalse();

    // Toggle to true
    $response = $this->post(route('users.toggle-status', $this->operator));
    $response->assertRedirect();

    $this->operator->refresh();
    expect($this->operator->is_active)->toBeTrue();
});

test('disabled user cannot access dashboard', function () {
    $this->operator->update(['is_active' => false]);

    $this->actingAs($this->operator);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('disabled user cannot login', function () {
    $this->operator->update(['is_active' => false]);

    $response = $this->post('/login', [
        'email' => 'operator@stockflow.com',
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('admin can create and delete custom role', function () {
    $this->actingAs($this->admin);

    // Create custom role
    $response = $this->post(route('roles.store'), [
        'name' => 'directeur_logistique',
    ]);
    $response->assertRedirect();

    $role = Role::where('name', 'directeur_logistique')->first();
    expect($role)->not->toBeNull();

    // Sync permissions
    $response = $this->put(route('roles.update', $role), [
        'permissions' => ['manage_warehouses', 'read_warehouses'],
    ]);
    $response->assertRedirect();

    expect($role->hasPermissionTo('manage_warehouses'))->toBeTrue();

    // Delete custom role
    $response = $this->delete(route('roles.destroy', $role));
    $response->assertRedirect();

    expect(Role::where('name', 'directeur_logistique')->exists())->toBeFalse();
});

test('admin cannot delete system roles', function () {
    $this->actingAs($this->admin);

    $adminRole = Role::where('name', 'admin')->first();
    $response = $this->delete(route('roles.destroy', $adminRole));

    $response->assertSessionHasErrors('error');
    expect(Role::where('name', 'admin')->exists())->toBeTrue();
});

test('admin can update item alerts and stock overrides', function () {
    $this->actingAs($this->admin);

    $item = Item::first();
    $warehouse = Warehouse::first();

    $response = $this->post(route('items.alerts.update', $item), [
        'warehouse_id' => $warehouse->id,
        'min_stock_override' => 15,
        'quantity' => 100,
    ]);

    $response->assertRedirect();

    $stock = Stock::where('item_id', $item->id)
        ->where('warehouse_id', $warehouse->id)
        ->first();

    expect($stock->min_stock_override)->toBe(15);
    expect($stock->quantity)->toBe(100);
});

test('admin can access items index with server side pagination and filtering', function () {
    $this->actingAs($this->admin);

    // Verify index access and paginated structure response
    $response = $this->get(route('items.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('items/index')
        ->has('items.data')
        ->has('items.links')
        ->has('categories')
        ->has('filters')
    );

    // Verify search filter (case-insensitive)
    $response = $this->get(route('items.index', ['search' => 'portable']));
    $response->assertOk();
    $items = $response->original->getData()['page']['props']['items']['data'];
    foreach ($items as $item) {
        expect(strtolower($item['name']).strtolower($item['sku']))->toContain('portable');
    }

    // Verify category filter
    $response = $this->get(route('items.index', ['category' => 'Outillage']));
    $response->assertOk();
    $items = $response->original->getData()['page']['props']['items']['data'];
    foreach ($items as $item) {
        expect($item['category'])->toBe('Outillage');
    }

    // Verify alert filter (LOW status)
    $response = $this->get(route('items.index', ['alert' => 'LOW']));
    $response->assertOk();
    $items = $response->original->getData()['page']['props']['items']['data'];
    foreach ($items as $item) {
        expect($item['is_low_stock'])->toBeTrue();
    }
});

test('admin can access movements index with server side pagination', function () {
    $this->actingAs($this->admin);

    $response = $this->get(route('movements.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('movements/index')
        ->has('movements.data')
        ->has('movements.links')
        ->has('warehouses')
        ->has('items')
    );
});
