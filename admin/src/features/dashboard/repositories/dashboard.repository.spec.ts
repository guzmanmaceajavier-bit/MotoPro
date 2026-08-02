import { dashboardRepository } from "../repositories/dashboard.repository";

describe('dashboard repository (skeleton)', () => {
  it('has fetchDashboard', () => {
    expect(typeof dashboardRepository.fetchDashboard).toBe('function');
  });
});
