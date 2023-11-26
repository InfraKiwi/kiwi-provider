import type { MyPartialRunContextOmit } from '../util/runContext';
import { RunContext } from '../util/runContext';
import { InventoryHost } from './inventoryHost';

export function getTestHost(): InventoryHost {
  return new InventoryHost('test', {});
}

export function getTestRunContext(partial?: Partial<MyPartialRunContextOmit>): RunContext {
  return new RunContext(getTestHost(), partial);
}
