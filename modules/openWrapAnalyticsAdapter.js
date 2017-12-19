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
          var url=protocol+OPENWRAP_ANALYTICS_URL+"wl/?pubid="+configOptions.publisherId+"&json="+window.encodeURIComponent(JSON.stringify(formatBidResponse(pbjs.getBidResponses(),pbjs.getHighestCpmBids())));
          setTimeout(function() {
            var img = new window.Image();
            img.src = url;
          }, 3000);
      }else if(eventType === 'bidWon') {//TODO: should use constants
          var windata= formatWinBidResponse(pbjs.getAllWinningBids());
          //console.log(windata);
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

function formatBidResponse(bidResponses,winningBids){
  console.log(winningBids);
  var date = new Date();
  var tst = Math.round( date.getTime()/1000 );
  var pv=0;
  for (var i = 0; i < winningBids.length; i++) {
    pv+=winningBids[i].cpm;
  }
  var logData={
    "pubid": ""+configOptions.publisherId,
    "to": ""+pbjs.cbTimeout,
    "purl": utils.getTopWindowUrl(),
    "tst": tst,
    "pid": "0",
    "pdvid": "0",
    "pv": pv,
    "src": "2",
    "sv": "prebid"+pbjs.version
  };
  var iid="";
  var bidinfoarray=[];

  for (var key in bidResponses) {
   if (bidResponses.hasOwnProperty(key)) {
      var bids=bidResponses[key].bids;
      var psArray=[];
      var bidinfo={};
      for (var i = 0; i < bidResponses[key].bids.length; i++) {
      iid=bids[i].requestId;
      var to=0;
      bidinfo={"sn": bids[0].adUnitCode,"sz": [bids[0].width+"x"+bids[0].height]}; // Hack to get one of the sizes, we should get all supported sizes for div
      if(bids[i].timeToRespond>pbjs.cbTimeout){
        to=1;
      }
        var wb=0;
        for (var j = 0; j < winningBids.length; j++) {
          if(winningBids[j].adId===bids[i].adId){
            wb=1;
          }
        }
      var ps={
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
            "t": parseInt(to),
            "wb": wb
        };

      psArray.push(ps);
      }
      bidinfo["ps"]=psArray;
      bidinfoarray.push(bidinfo);
      //console.log(key, yourobject[key]);
   }
  }
  logData["s"]=bidinfoarray;
  logData["iid"]=iid;
  //console.log(logData);
  return logData;

};


function formatWinBidResponse(bidResponses){
  
  var date = new Date();
  var tst = Math.round( date.getTime()/1000 );
  var logData=[];
  var bidinfoarray=[];

  for (var i = 0; i < bidResponses.length; i++) {
        var data="pubid="+configOptions.publisherId+"&purl="+ window.encodeURIComponent(utils.getTopWindowUrl())+"&tst="+tst+"&iid="+bidResponses[i].requestId+"&bidid="+bidResponses[i].adId+"&pid=0&pdvid=0&slot="+bidResponses[i].adUnitCode+"&pn="+bidResponses[i].bidderCode+"&en="+bidResponses[i].cpm+"&eg="+bidResponses[i].cpm+"&kgpv="+window.encodeURIComponent(bidResponses[i].adSlot);
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
