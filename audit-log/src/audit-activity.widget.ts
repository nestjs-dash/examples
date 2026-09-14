import { AuditLogEntity } from '@nestjs-dash/audit-log';
import { BarChart, StatCard } from '@nestjs-dash/core';
import type { DataSource } from 'typeorm';

/**
 * Demonstrates reading the audit trail directly, rather than only browsing
 * it through the auto-registered "Activity" resource (see
 * `AdminActivityResource`, registered by `AdminModule` itself once
 * `audit.enabled` is true — nav group "System"). `AuditLogEntity` is the
 * same TypeORM entity `@nestjs-dash/audit-log` persists every audited
 * mutation to (`nestjs_dash_audit_log` table) — nothing prevents a custom
 * widget, page, or report from querying it like any other entity.
 */
export function buildAuditEventsTodayWidget(dataSource: DataSource): StatCard {
  return StatCard.make('Audit events today').value(async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return dataSource
      .getRepository(AuditLogEntity)
      .createQueryBuilder('log')
      .where('log.created_at >= :startOfDay', { startOfDay })
      .getCount();
  });
}

export function buildAuditEventsByActionWidget(dataSource: DataSource): BarChart {
  return BarChart.make()
    .title('Audit events by action')
    .category('action')
    .series([{ key: 'count', label: 'Events', color: 1 }])
    .emptyLabel('No audit events yet — create, edit, or delete an author/book to see this chart.')
    .data(async () => {
      const rows = await dataSource
        .getRepository(AuditLogEntity)
        .createQueryBuilder('log')
        .select('log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.action')
        .orderBy('count', 'DESC')
        .getRawMany<{ action: string; count: string }>();
      return rows.map((row) => ({ action: row.action, count: Number(row.count) }));
    });
}
