import {ajax} from 'src/ajax';
import adapter from 'src/AnalyticsAdapter';
import adaptermanager from 'src/adaptermanager';

const OPENWRAP_BIDDER_CODE = 'openwrapanalytics';
const analyticsType = 'endpoint';
const OPENWRAP_VERSION = '7';
const OPENWRAP_ANALYTICS_URL = '//analytics-pubmatic.com/';
var events = {};

var openWrapAnalyticsAdapter = Object.assign(adapter(
  {
    OPENWRAP_ANALYTICS_URL,
    analyticsType
  }),
{
  track({eventType, args}) {
    if (typeof args !== 'undefined' && args.bidderCode === OPENWRAP_BIDDER_CODE) {
      events[eventType] = args;
    }

    if (eventType === 'auctionEnd') {
      setTimeout(function() {
        ajax(
          OPENWRAP_ANALYTICS_URL,
          {
            success: function() {},
            error: function() {}
          },
          JSON.stringify(formatBidResponse(pbjs.getBidResponses())),
          {
            method: 'POST'
          }
        );
      }, 3000);
    }
  }
}
);

function formatBidResponse(bidResponses){
  
  var logData={
    "pubid": "get-from-config",
    "to": "get-prebid-timeout",
    "purl": "http://www.get-page-url.com/",
    "tst": 1507670231,
    "pid": "0",
    "pdvid": "0",
    "iid": "generate-random-impression-id",
    //"s" :[]
  }
  var bidinfoarray=[];
  for (var key in bidResponses) {
   if (bidResponses.hasOwnProperty(key)) {
      var bids=bidResponses[key].bids;
      for (var i = 0; i < bidResponses[key].bids.length; i++) {
      var bidinfo={
        "sn": bids[i].adUnitCode,
        "sz": [bids[i].size],
        "ps": [{
            "pn": bids[i].bidderCode,
            "bidid": bids[i].adId,
            "db": 0,
            "kgpv": bids[i].adSlot,//"/1050432/FE_Across_4th_New_300x250@300x250:0",
            "psz": bids[i].size,
            "eg": bids[i].cpm,
            "en": bids[i].cpm,
            "di": "",
            "dc": "",
            "l1": bids[i].timeToRespond,
            "l2": 0,
            "t": 0,
            "wb": 0
        }]
      }
      bidinfoarray.push(bidinfo);
      };

      //console.log(key, yourobject[key]);
   }
  }
  logData["s"]=bidinfoarray;
  return logData;

}
adaptermanager.registerAnalyticsAdapter({
  adapter: openWrapAnalyticsAdapter,
  code: 'openwrapanalytics'
});

export default openWrapAnalyticsAdapter;
