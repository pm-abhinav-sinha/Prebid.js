import * as utils from 'src/utils';
import {registerBidder} from 'src/adapters/bidderFactory';
const constants = require('src/constants.json');

const BIDDER_CODE = 'intelliRecommendation';
const ENDPOINT = '//hello-world.com:8001/reco/';
const CURRENCY = 'USD';
const AUCTION_TYPE = 1; // PubMaticServer just picking highest bidding bid from the partners configured
const UNDEFINED = undefined;
const IFRAME = 'iframe';
const IMAGE = 'image';
const REDIRECT = 'redirect';
const DEFAULT_VERSION_ID = '0';

const CUSTOM_PARAMS = {
    'kadpageurl': '', // Custom page url
    'gender': '', // User gender
    'yob': '', // User year of birth
    'lat': '', // User location - Latitude
    'lon': '', // User Location - Longitude
    'wiid': '', // OpenWrap Wrapper Impression ID
    'profId': '', // OpenWrap Legacy: Profile ID
    'verId': '', // OpenWrap Legacy: version ID
    'divId': '' // OpenWrap new
};

function logNonStringParam(paramName, paramValue) {
    utils.logWarn(BIDDER_CODE + ': Ignoring param : ' + paramName + ' with value : ' + paramValue + ', expects string-value, found ' + typeof paramValue);
}

function _parseSlotParam(paramName, paramValue) {
    if (!utils.isStr(paramValue)) {
        paramValue && logNonStringParam(paramName, paramValue);
        return UNDEFINED;
    }

}

function _initConf() {
    var conf = {};
    return conf;
}

function _handleCustomParams(params, conf) {
    // istanbul ignore else
    if (!conf.kadpageurl) {
        conf.kadpageurl = conf.pageURL;
    }
    return conf;
}

function _createOrtbTemplate(conf) {
    return {
        id: '' + new Date().getTime(),
        at: AUCTION_TYPE,
        cur: [CURRENCY],
        imp: [],
        site: {
            page: conf.pageURL,
            ref: conf.refURL,
            publisher: {}
        },
        device: {
            ua: navigator.userAgent,
            js: 1,
            dnt: (navigator.doNotTrack == 'yes' || navigator.doNotTrack == '1' || navigator.msDoNotTrack == '1') ? 1 : 0,
            h: screen.height,
            w: screen.width,
            language: navigator.language
        },
        user: {},
        ext: {}
    };
}

function _createImpressionObject(bid, conf) {
    return {
    };
}

function mandatoryParamCheck(paramName, paramValue) {
    return true;
}

export const spec = {
    code: BIDDER_CODE,

    /**
     * Determines whether or not the given bid request is valid. Valid bid request must have placementId and hbid
     *
     * @param {BidRequest} bid The bid params to validate.
     * @return boolean True if this is a valid bid, and false otherwise.
     */
    isBidRequestValid: bid => {
        // if (bid && bid.params) {
        //     return mandatoryParamCheck('publisherId', bid.params.publisherId) &&
        //         mandatoryParamCheck('adUnitId', bid.params.adUnitId) &&
        //         mandatoryParamCheck('divId', bid.params.divId) &&
        //         mandatoryParamCheck('adUnitIndex', bid.params.adUnitIndex);
        // }
        return true;
    },

    /**
     * Make a server request from the list of BidRequests.
     *
     * @param {validBidRequests[]} - an array of bids
     * @return ServerRequest Info describing the request to the server.
     */
    buildRequests: validBidRequests => {
        return {
            method: 'GET',
            url: ENDPOINT,
            data: "test"
        };
    },

    /**
     * Unpack the response from the server into a list of bids.
     *
     * @param {*} response A successful response from the server.
     * @return {Bid[]} An array of bids which were nested inside the server.
     */
    interpretResponse: (response, request) => {
        const bidResponses = [];
        try { 
                if(BIDDER_CODE+': Recommendation data received: '+response.body){
                  console.log(response.body);
                localStorage.setItem("intelliRecommendation",JSON.stringify(response.body));
              }
        } catch (error) {
            utils.logError(error);
        }
        return bidResponses;
    },

    /**
     * Register User Sync.
     */
    getUserSyncs: (syncOptions, serverResponses) => {
        let serverResponse;
        let urls = [];
        return urls;
    }
};

registerBidder(spec);