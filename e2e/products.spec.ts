import { test, expect } from '@playwright/test';

test('Product List Page Loads and Displays Items', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Verify Title (Breadcrumb or sidebar might be visible, checking generic presence)
    // await expect(page.getByRole('heading', { name: 'Our Premium Products' })).toBeVisible();

    // Verify Products are loaded (Mock Data has 12 items)
    const firstProduct = page.locator('.group').first();
    await expect(firstProduct).toBeVisible();

    // Hover to reveal the button (since it has opacity-0 group-hover:opacity-100)
    await firstProduct.hover();

    // Verify button is now visible
    const addToCartBtn = page.locator('button', { hasText: 'Add to Cart' }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
});
