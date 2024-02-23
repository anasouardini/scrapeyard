export { type RequestBodyType } from '../../../utils/types';
import sharedVars from '../../../utils/globalVars';

export default {
  eventName: sharedVars.eventName,
  //* if it's a blank page it's fetching a dummy url
  serverFakeAddress: window.location.toString().includes('http')
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://dummy.com',
};
