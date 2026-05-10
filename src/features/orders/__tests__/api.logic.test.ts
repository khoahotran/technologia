import { describe, it, expect, vi } from 'vitest';
import { getAdminOrders, updateOrderStatus, getOrders, submitOrderFeedback, simulatePayment, getOrderIdBySagaId } from '../api';
import * as client from '@/api/client';
import { createMockOrder } from '@/test/factories';

vi.mock('@/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe('Orders API Logic', () => {
  describe('getAdminOrders', () => {
    it('should filter out invalid orders that fail safeParse', async () => {
      const validOrder = {
        orderId: 'valid-1',
        orderDate: new Date().toISOString(),
        totalAmount: 100,
        deliveryStatus: 'PENDING',
        paymentMethod: 'COD',
        addressId: 'addr-1',
        customerId: 'cust-1',
        updatedAt: new Date().toISOString(),
        items: []
      };
      
      const invalidOrder = {
        orderId: 'invalid-1',
        // missing required fields for OrderSchema
      };

      (client.get as any).mockResolvedValue({
        data: [validOrder, invalidOrder],
        page_number: 0,
        page_size: 20,
        count_items: 2,
        count_pages: 1
      });

      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await getAdminOrders();
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].orderId).toBe('valid-1');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('[Orders] Skipping invalid admin order:'), expect.any(Array), 'invalid-1');
      
      spy.mockRestore();
    });
  });

  describe('updateOrderStatus', () => {
    it('should call patch with correctly parsed status', async () => {
      (client.patch as any).mockResolvedValue({});
      
      await updateOrderStatus('order-123', 'DELIVERED');
      
      expect(client.patch).toHaveBeenCalledWith(
        '/api/orders/admin/order-123/status',
        { newStatus: 'DELIVERED' }
      );
    });
  });

  describe('getOrders', () => {
    it('should use different endpoint when status is provided', async () => {
       (client.get as any).mockResolvedValue({
        data: [],
        page_number: 0,
        page_size: 20,
        count_items: 0,
        count_pages: 0
      });
      
      await getOrders({ status: 'DELIVERED' });
      
      expect(client.get).toHaveBeenCalledWith(
        '/api/orders/by-delivery-status',
        expect.objectContaining({
          params: expect.objectContaining({ deliveryStatus: 'DELIVERED' })
        })
      );
    });
  });

  describe('submitOrderFeedback', () => {
    it('should submit feedback for all items and return updated order', async () => {
      (client.post as any).mockResolvedValue({});
      (client.get as any).mockResolvedValue({
        status: 200,
        data: {
            orderId: 'order-123',
            orderDate: new Date().toISOString(),
            totalAmount: 100,
            deliveryStatus: 'DELIVERED',
            paymentMethod: 'COD',
            addressId: 'addr-1',
            customerId: 'cust-1',
            updatedAt: new Date().toISOString(),
            items: []
        }
      });
      
      const result = await submitOrderFeedback({
        orderId: 'order-123',
        items: [{ orderItemId: 'item-1', rating: 5, comment: 'Great!' }]
      });
      
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(result.orderId).toBe('order-123');
    });
  });

  describe('Payment Simulation', () => {
    it('should call simulate payment endpoint', async () => {
      (client.post as any).mockResolvedValue({});
      await simulatePayment('order-1', 'pay-1', 'saga-1');
      expect(client.post).toHaveBeenCalledWith('/api/payments/simulate', {
        orderId: 'order-1',
        paymentId: 'pay-1',
        sagaId: 'saga-1'
      });
    });
  });

  describe('getOrderIdBySagaId', () => {
    it('should return orderId from saga response', async () => {
      (client.get as any).mockResolvedValue({ data: { orderId: 'order-999' } });
      const result = await getOrderIdBySagaId('saga-123');
      expect(result).toBe('order-999');
    });

    it('should return null if orderId missing', async () => {
      (client.get as any).mockResolvedValue({ data: {} });
      const result = await getOrderIdBySagaId('saga-123');
      expect(result).toBeNull();
    });
  });
});

