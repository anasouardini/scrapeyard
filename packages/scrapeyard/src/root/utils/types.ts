import { BrowserContext } from 'playwright';
import serverVars from '../../root/utils/serverVars';

export type RequestBodyType = {
  eventType: 'runAction' | 'clientRequestsUpdate';
  action?: string;
  data?: string | {};
};

export type ActionMethod = (driver: BrowserContext, args?: any) => void;
export type ActionMethodWrapper = (root: Record<string, any>) => ActionMethod;

export interface DispatcherMsg {
  type: 'scrapeyardEvent' | 'direct';
  action: string | ActionMethodWrapper | ActionMethod;
  data: any;
}

export type Actions = Record<string, DispatcherMsg[]>;
