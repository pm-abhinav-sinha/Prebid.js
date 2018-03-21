'use strict';

import {registerBidder} from 'src/adapters/bidderFactory';
import { BANNER, VIDEO } from 'src/mediaTypes';

function RhythmOneBidAdapter() {
  this.code = 'rhythmone';
  this.supportedMediaTypes = [VIDEO, BANNER];

  this.isBidRequestValid = function (bid) {
    return true;
  };

  function getFirstParam(key, validBidRequests) {
    for (let i = 0; i < validBidRequests.length; i++) {
      if (validBidRequests[i].params && validBidRequests[i].params[key]) {
        return validBidRequests[i].params[key];
      }
    }
  }

  let slotsToBids = {};
  let that = this;
  let version = '1.0.0.0';

  this.buildRequests = function (BRs) {
    let fallbackPlacementId = getFirstParam('placementId', BRs);
    if (fallbackPlacementId === undefined || BRs.length < 1) {
      return [];
    }

    slotsToBids = {};

    let query = [];
    let w = (typeof window !== 'undefined' ? window : {});

    function p(k, v) {
      if (v instanceof Array) { v = v.join(','); }
      if (typeof v !== 'undefined') { query.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); }
    }

    function attempt(valueFunction, defaultValue) {
      try {
        return valueFunction();
      } catch (ex) { }
      return defaultValue;
    }

    p('domain', attempt(function() {
      var d = w.document.location.ancestorOrigins;
      if (d && d.length > 0) {
        return d[d.length - 1];
      }
      return w.top.document.location.hostname; // try/catch is in the attempt function
    }, ''));
    p('url', attempt(function() {
      var l;
      // try/catch is in the attempt function
      try {
        l = w.top.document.location.href.toString();
      } catch (ex) {
        l = w.document.location.href.toString();
      }
      return l;
    }, ''));

    configuredPlacements = [];

    p('hbv', $$PREBID_GLOBAL$$.version.replace(fat, '') + ',' + version.replace(fat, ''));

    for (; i < bids.length; i++) {
      const th = [];
      const tw = [];

      if (bids[i].sizes.length > 0 && typeof bids[i].sizes[0] === 'number') { bids[i].sizes = [bids[i].sizes]; }

      for (var j = 0; j < bids[i].sizes.length; j++) {
        tw.push(bids[i].sizes[j][0]);
        th.push(bids[i].sizes[j][1]);
      }

      p('imp', configuredPlacements);
      p('w', widths);
      p('h', heights);
      p('floor', floors);
      p('t', mediaTypes);

      url += '&' + query.join('&') + '&';

    return endpoint;
  }

  function sendAuditBeacon(placementId) {
    const data = {
      doc_version: 1,
      doc_type: 'Prebid Audit',
      placement_id: placementId
    };
    const ao = document.location.ancestorOrigins;
    const q = [];
    const u = '//hbevents.1rx.io/audit?';
    const i = new Image();

    if (ao && ao.length > 0) {
      data.ancestor_origins = ao[ao.length - 1];
    }

    data.popped = window.opener !== null ? 1 : 0;
    data.framed = window.top === window ? 0 : 1;

    try {
      data.url = window.top.document.location.href.toString();
    } catch (ex) {
      data.url = window.document.location.href.toString();
    }

    var prebid_instance = $$PREBID_GLOBAL$$;

    data.prebid_version = prebid_instance.version.replace(fat, '');
    data.response_ms = (new Date()).getTime() - loadStart;
    data.placement_codes = configuredPlacements.join(',');
    data.bidder_version = version;
    data.prebid_timeout = prebid_instance.cbTimeout || config.getConfig('bidderTimeout');

    for (var k in data) {
      q.push(encodeURIComponent(k) + '=' + encodeURIComponent((typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k])));
    }

    return [{
      method: 'GET',
      url: getRMPUrl()
    }];
  };

  this.interpretResponse = function (serverResponse) {
    let responses = serverResponse.body || [];
    let bids = [];
    let i = 0;

    if (responses.seatbid) {
      let temp = [];
      for (i = 0; i < responses.seatbid.length; i++) {
        for (let j = 0; j < responses.seatbid[i].bid.length; j++) {
          temp.push(responses.seatbid[i].bid[j]);
        }
      }
      responses = temp;
    }

    for (i = 0; i < responses.length; i++) {
      let bid = responses[i];
      let bidRequest = slotsToBids[bid.impid];
      let bidResponse = {
        requestId: bidRequest.bidId,
        bidderCode: that.code,
        cpm: parseFloat(bid.price),
        width: bid.w,
        height: bid.h,
        creativeId: bid.crid,
        currency: 'USD',
        netRevenue: true,
        ttl: 1000
      };

      if (bidRequest.mediaTypes && bidRequest.mediaTypes.video) {
        bidResponse.vastUrl = bid.nurl;
        bidResponse.ttl = 10000;
      } else {
        bidResponse.ad = bid.adm;
      }
      bids.push(bidResponse);
    }
    return bids;
  };
}

export const spec = new RhythmOneBidAdapter();
registerBidder(spec);
