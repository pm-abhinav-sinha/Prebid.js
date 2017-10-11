import {ajax} from 'src/ajax';
import adapter from 'src/AnalyticsAdapter';
import adaptermanager from 'src/adaptermanager';
var utils = require('src/utils');

const OPENWRAP_BIDDER_CODE = 'openwrapanalytics';
const analyticsType = 'endpoint';
const OPENWRAP_VERSION = '7';
const OPENWRAP_ANALYTICS_URL = '//analytics-pubmatic.com/';
//const MAX_PAGE_URL_LEN=512;

var events = {};
var configOptions={"publisherId":'0000'}
//var pageURL = ( frame !== window.top && frame.document.referrer != ""  ? frame.document.referrer : frame.location.href).substr(0, MAX_PAGE_URL_LEN );
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
  var uuid=generateUUID();
  var date = new Date();
  var tst = Math.round( date.getTime()/1000 );
  var logData={
    "pubid": configOptions.publisherId,
    "to": pbjs.cbTimeout,
    "purl": utils.getTopWindowUrl(),
    "tst": tst,
    "pid": "0",
    "pdvid": "0",
    "iid": uuid,
    "src": "2",
    "sv": "prebid"+pbjs.version
  }
  var bidinfoarray=[];
  for (var key in bidResponses) {
   if (bidResponses.hasOwnProperty(key)) {
      var bids=bidResponses[key].bids;
      for (var i = 0; i < bidResponses[key].bids.length; i++) {
      var bidinfo={
        "sn": bids[i].adUnitCode,
        "sz": [bids[i].width+"x"+bids[i].height],
        "ps": [{
            "pn": bids[i].bidderCode,
            "bidid": bids[i].adId,
            "db": 0,
            "kgpv": bids[i].adSlot,//"/1050432/FE_Across_4th_New_300x250@300x250:0",
            "psz": bids[i].width+"x"+bids[i].height,
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

};
function generateUUID(){
  var d = new window.Date().getTime(),
      // todo: this.pageURL ???
    url = window.decodeURIComponent(utils.getTopWindowUrl()).toLowerCase().replace(/[^a-z,A-Z,0-9]/gi, ""),
    urlLength = url.length
    ;

    //todo: uncomment it,  what abt performance
    //if(win.performance && this.isFunction(win.performance.now)){
    //    d += performance.now();
    //}

  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx-zzzzz".replace(/[xyz]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    var op;
    switch(c){
    case "x":
      op = r;
      break;
    case "z":
      op = url[Math.floor(Math.random()*urlLength)];
      break;
    default:
      op = (r&0x3|0x8);
    }

    return op.toString(16);
  });

  return uuid;
};

openWrapAnalyticsAdapter.adapterEnableAnalytics = openWrapAnalyticsAdapter.enableAnalytics;

openWrapAnalyticsAdapter.enableAnalytics = function (config) {
  configOptions = config.options;
  openWrapAnalyticsAdapter.adapterEnableAnalytics(config);
};



adaptermanager.registerAnalyticsAdapter({
  adapter: openWrapAnalyticsAdapter,
  code: 'openwrapanalytics'
});

export default openWrapAnalyticsAdapter;
