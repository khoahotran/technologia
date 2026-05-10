import * as client from '@/api/client';
import { describe, expect, it, vi } from 'vitest';
import { createMonthlyRevenueReport, getAdminActionLogs, getLatestDeliveryLog, getReports } from '../api';

vi.mock('@/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe('Admin API Logic', () => {
  describe('getReports', () => {
    it('should return paginated reports with default fallback values', async () => {
      (client.get as any).mockResolvedValue({
        data: [{ reportId: 'r-1' }],
        page_number: 1,
        page_size: 10,
        count_items: 1,
        count_pages: 1
      });

      const result = await getReports();

      expect(result.items).toHaveLength(1);
      expect(result.pageNumber).toBe(1);
    });

    it('should handle empty data response', async () => {
      (client.get as any).mockResolvedValue({
        data: null
      });

      const result = await getReports();
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
    });
  });

  describe('getAdminActionLogs', () => {
    it('should handle empty logs with defaults', async () => {
      (client.get as any).mockResolvedValue({});

      const result = await getAdminActionLogs();
      expect(result.items).toEqual([]);
      expect(result.pageNumber).toBe(0);
    });
  });

  describe('getLatestDeliveryLog', () => {
    it('should return null if no log found', async () => {
      (client.get as any).mockResolvedValue({ data: null });
      const result = await getLatestDeliveryLog('order-1');
      expect(result).toBeNull();
    });

    it('should return log data', async () => {
      (client.get as any).mockResolvedValue({ data: { deliveryLogId: 'log-1' } });
      const result = await getLatestDeliveryLog('order-1');
      expect(result?.deliveryLogId).toBe('log-1');
    });
  });

  describe('createMonthlyRevenueReport', () => {
    it('should call post with payload', async () => {
      const payload = { reportItems: [{ month: 'JANUARY' as const, revenue: 1000 }] };
      (client.post as any).mockResolvedValue({ data: { reportId: 'new-1' } });

      const result = await createMonthlyRevenueReport(payload);
      expect(client.post).toHaveBeenCalledWith('/api/admins/reports/monthly-revenue', payload);
      expect(result.reportId).toBe('new-1');
    });
  });
});
