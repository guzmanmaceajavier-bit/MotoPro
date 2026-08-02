import { mapToDashboardMetrics } from "../mappers/dashboard.mapper";

describe('dashboard.mapper (skeleton)', () => {
  it('maps safely', () => {
    const m = mapToDashboardMetrics({}, []);
    expect(m.monthRevenue).toBeDefined();
  });
});
