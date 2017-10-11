import {ajax} from 'src/ajax';
import adapter from 'src/AnalyticsAdapter';
import adaptermanager from 'src/adaptermanager';
var utils = require('src/utils');

const OPENWRAP_BIDDER_CODE = 'openwrapanalytics';
const analyticsType = 'endpoint';
const OPENWRAP_ANALYTICS_URL = '//t.pubmatic.com/';

var events = {};
var configOptions={"publisherId":'0000'}

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

      if (eventType === 'auctionEnd') {//TODO: should use constants
          var protocol = (document.location.protocol === 'https:') ? 'https:' : 'http:';
          var url=protocol+OPENWRAP_ANALYTICS_URL+"wl/?pubid="+configOptions.publisherId+"&json="+JSON.stringify(formatBidResponse(pbjs.getBidResponses()));
          setTimeout(function() {
            var img = new window.Image();
            img.src = url;
          }, 3000);
      }else if(eventType === 'bidWon') {//TODO: should use constants
          var windata= formatWinBidResponse(pbjs.getAllWinningBids());
          console.log(windata);
          for (var i = 0; i < windata.length; i++) {
            var url=OPENWRAP_ANALYTICS_URL+"wt/?"+windata[i];
            setTimeout(function() {
              var img = new window.Image();
              img.src = url;
            }, 3000);
            
        };

      }
    }
  }
);

function formatBidResponse(bidResponses){
  var date = new Date();
  var tst = Math.round( date.getTime()/1000 );
  var logData={
    "pubid": configOptions.publisherId,
    "to": pbjs.cbTimeout,
    "purl": utils.getTopWindowUrl(),
    "tst": tst,
    "pid": "0",
    "pdvid": "0",
    //"iid": uuid,
    "src": "2",
    "sv": "prebid"+pbjs.version
  }
  var iid="";
  var bidinfoarray=[];
  for (var key in bidResponses) {
   if (bidResponses.hasOwnProperty(key)) {
      var bids=bidResponses[key].bids;
      for (var i = 0; i < bidResponses[key].bids.length; i++) {
      iid=bids[i].requestId;
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
  logData["iid"]=iid;
  return logData;

};


function formatWinBidResponse(bidResponses){
  
  var date = new Date();
  var tst = Math.round( date.getTime()/1000 );
  var logData=[];
  var bidinfoarray=[];

  for (var i = 0; i < bidResponses.length; i++) {
        var data="pubid="+configOptions.publisherId+"&purl="+ utils.getTopWindowUrl()+"&pwtv=0&profileid=0&tst="+tst+"&iid="+bidResponses[i].requestId+"&bidid="+bidResponses[i].adId+"&pid=0&pdvid=0&slot="+bidResponses[i].adUnitCode+"&pn="+bidResponses[i].bidderCode+"&en="+bidResponses[i].cpm+"&eg="+bidResponses[i].cpm+"&kgpv="+bidResponses[i].adUnitCode;
        logData[i]=data;
    }
  return logData;

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
