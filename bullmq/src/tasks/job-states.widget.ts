import { PieChart } from '@nestjs-dash/core';
import { tasksQueue } from './queue.js';

/**
 * Reuses BullMQ's own already-computed `getJobCounts()` (the same call the
 * queue-explorer plugin's widget makes) — demonstrates a dashboard mixing
 * both `render()`- (BullMQ's HTML widget) and `chart()`-based widgets in
 * the same panel.
 */
export function buildJobStatesWidget(): PieChart {
  return PieChart.make()
    .title('Job states')
    .side()
    .category('state')
    .series([{ key: 'count', label: 'Jobs' }])
    .emptyLabel('No jobs yet — run a task to see this chart.')
    .data(async () => {
      const counts = await tasksQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
      return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([state, count]) => ({ state, count }));
    });
}
