import { registerBidder } from 'src/adapters/bidderFactory.js';
import { BANNER } from 'src/mediaTypes.js';

const BIDDER_CODE = 'geozo';
const ENDPOINT_URL = 'http://14019.nl1.gedsp.com/v4/dsp/14019';

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER],

  isBidRequestValid: function (bid) {
    return !!(bid && bid.params && bid.params.siteId);
  },

  buildRequests: function (validBidRequests, bidderRequest) {
    const requests = validBidRequests.map(bid => {
      const payload = {
        id: bid.bidId,
        imp: [
          {
            id: '1',
            native: {
              request: JSON.stringify({
                ver: '1.2',
                assets: [
                  { id: 1, required: 1, title: { len: 50 } },
                  { id: 2, required: 1, img: { type: 3, w: 300, h: 250 } },
                  { id: 3, required: 0, data: { type: 2, len: 100 } }
                ]
              })
            }
          }
        ],
        site: {
          id: bid.params.siteId,
          domain: 'example.com'
        },
        device: {
          ip: bid.params.ip,
          ua: navigator.userAgent
        },
        user: {
          id: 'user_id'
        },
        geo: {
          country: bid.params.geo
        }
      };

      return {
        method: 'POST',
        url: ENDPOINT_URL,
        data: JSON.stringify(payload),
        options: {
          contentType: 'application/json'
        }
      };
    });

    return requests;
  },

  interpretResponse: function (serverResponse, bidRequest) {
    const bidResponses = [];
    const response = serverResponse.body;

    if (response && response.seatbid && response.seatbid[0].bid && response.seatbid[0].bid[0]) {
      const bid = response.seatbid[0].bid[0];
      const adm = JSON.parse(bid.adm);
      //pushing it into banner ad units cause ain't no way i make native requests
      let bidResponse = {
        requestId: bidRequest.data.id,
        cpm: bid.price,
        width: adm.assets[1].img.w,
        height: adm.assets[1].img.h,
        creativeId: bid.crid,
        currency: 'USD',
        netRevenue: true,
        ttl: 300,
        ad: `<div class='ad' style='background-color: rgba(255, 255, 255, 0.8);'>
               <a href='${adm.link.url}' target='_blank'>
                 <img src='${adm.assets[1].img.url}' alt='${adm.assets[0].title.text}' style='width: 320px; height: 180px;'>
                 <h2>${adm.assets[0].title.text}</h2>
               </a>
             </div>`
      };

      bidResponses.push(bidResponse);
    }

    return bidResponses;
  }
};

registerBidder(spec);
