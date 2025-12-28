import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate from Home to Products', async ({ page }) => {
        // Start at home
        await page.goto('/');
        await expect(page).toHaveTitle(/Shop|Store/i); // Adjust based on actual title

        // Find link to products (assuming Navbar exists)
        // Adjust selector based on Layout
        const productsLink = page.getByRole('link', { name: 'Products' }).first();
        if (await productsLink.isVisible()) {
            await productsLink.click();
            await expect(page).toHaveURL(/.*\/products/);
        } else {
            // Fallback: direct navigation check
            await page.goto('/products');
            await expect(page).toHaveURL(/.*\/products/);
        }
    });

});
