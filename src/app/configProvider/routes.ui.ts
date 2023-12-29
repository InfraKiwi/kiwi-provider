/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { IRouter } from 'express';
import express from 'express';
import nunjucks from 'nunjucks';
import path from 'node:path';
import type { Logger } from 'winston';
import type { HostLogs, PrismaClient } from '@prisma/client';
import { nunjucksApplyCustomFunctions } from '../../util/tpl';

interface RoutesUIContext {
  logger: Logger;
  client: PrismaClient;
}

interface ReportGroup {
  hostname: string;
  release: string;
  status: string;
  timestamp: Date;
  logs: HostLogs[];
}

export function mountRoutesUI(context: RoutesUIContext, app: IRouter) {
  const ui = express.Router();
  ui.use('/static', express.static(path.join(__dirname, 'static')));

  const nj = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'views'), { watch: true }), {
    autoescape: true,
  });
  nunjucksApplyCustomFunctions(nj);

  ui.get('/', (req, res) => {
    res.send(nj.render('index.html'));
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  ui.get('/report', async (req, res) => {
    const reports = await context.client.hostReport.findMany({
      orderBy: { timestamp: 'desc' },
      include: { logs: { orderBy: { timestamp: 'desc' } } },
    });

    const groupsOrder: string[] = [];
    const groups: Record<string, ReportGroup> = {};
    // Group logs for UI purposes
    for (const report of reports) {
      const groupKey = [report.hostname, report.release].join(',');
      if (groups[groupKey] == null) {
        groupsOrder.push(groupKey);
        groups[groupKey] = {
          hostname: report.hostname,
          release: report.release,
          status: report.status,
          timestamp: report.timestamp,
          logs: report.logs,
        };
        continue;
      }

      groups[groupKey].logs.push(...report.logs);
    }

    for (const groupsKey in groups) {
      groups[groupsKey].logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    res.send(
      nj.render('report.html', {
        groups,
        groupsOrder,
      })
    );
  });

  app.use('/ui', ui);
}
