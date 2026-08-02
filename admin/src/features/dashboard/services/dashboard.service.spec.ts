import { dashboardService } from "../services/dashboard.service";

describe('dashboard.service (skeleton)', () => {
  it('exposes getDashboardData', () => {
    expect(typeof dashboardService.getDashboardData).toBe('function');
  });
});
