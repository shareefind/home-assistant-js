'use strict';

import _ from 'lodash';
import dispatcher from '../app_dispatcher';
import constants from '../constants';
import Store from './store';

let services = [];

class ServiceStore extends Store {

  get all() {
    return services;
  }

  has(domain, service) {
    return this.getServices(domain).indexOf(service) !== -1;
  }

  getDomain(domain) {
    return _.find(services, function(service) {
      return service.domain === domain;
    });
  }

  getServices(domain) {
    let domain = this.getDomain(domain);

    return domain ? domain.services : [];
  }

}

const INSTANCE = new ServiceStore();

INSTANCE.dispatchToken = dispatcher.register(function(payload) {
  switch(payload.actionType) {
    case constants.ACTION_NEW_SERVICES:
      services = payload.services;
      INSTANCE.emitChange();
      break;

    case constants.ACTION_REMOTE_EVENT_RECEIVED:
      if (payload.event.event_type === constants.REMOTE_EVENT_SERVICE_REGISTERED) {
        let data = payload.event.data;

        let domainObj = _getDomain(data.domain);

        if (domainObj) {
          domainObj.services.push(data.service);
        } else {
          services.push({domain: data.domain, services: [data.service]});
        }

        INSTANCE.emitChange();
      }
      break;

    case constants.ACTION_LOG_OUT:
      services = [];
      INSTANCE.emitChange();
      break;
  }
});

export default INSTANCE;
