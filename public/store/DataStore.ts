import { RulesStore } from '../pages/Rules/store/RulesStore';
import { BrowserServices } from '../models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';

export class DataStore {
  public static rules: RulesStore;

  public static init = (services: BrowserServices, notifications: NotificationsStart) => {
    DataStore.rules = new RulesStore(services.ruleService, notifications);
  };
}
