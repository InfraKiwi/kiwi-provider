import { NotifierHTTPSchema } from './schema';
import { newDebug } from '../../util/debug';
import { notifierRegistryEntryFactory } from '../registry';
import type { NotifierHTTPInterface } from './schema.gen';
import { AbstractNotifier } from '../abstractNotifier';
import { DataSourceHTTP } from '../../dataSources/http';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';

const debug = newDebug(__filename);

export class NotifierHTTP extends AbstractNotifier<NotifierHTTPInterface> {
  #dataSource = new DataSourceHTTP(this.config);

  async notify(context: DataSourceContext): Promise<void> {
    const result = await this.#dataSource.load(context);
    context.logger.info(`HTTP notification sent`, { result });
  }
}

notifierRegistryEntryFactory.register(NotifierHTTPSchema, NotifierHTTP);
