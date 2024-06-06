# geozo-bid-adapter

call via prebid.js with the following params:

{
        code: 'banner-ad-div',
        mediaTypes: {
          banner: {
            sizes: [[300, 250]]
          }
        },
        bids: [{
          bidder: 'customAdapter',
          params: {
            siteId: 'site_id',
            ip: geoData.ip,
            geo: geoData.country
          }
        }]
      }
