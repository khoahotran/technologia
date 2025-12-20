import { test, expect } from '@playwright/test';

test('Product List Page Loads and Displays Items', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Verify Title
    await expect(page.getByRole('heading', { name: 'Our Premium Products' })).toBeVisible();

    // Verify Products are loaded (Mock Data has 10 items, but we check at least one)
    const products = page.locator('.group'); // Tailwind class we used for product card container
    await expect(products.first()).toBeVisible();

    // Verify content of first product (based on Mock)
    await expect(page.getByText('Product 1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('$100.00')).toBeVisible();

    // Verify interaction
    const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
});
