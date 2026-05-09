/**
 * Verified company slugs for each ATS platform.
 * Used when no specific company is provided — the scraper queries all of them in parallel.
 * Add/remove slugs here to control which companies are checked per platform.
 */

export const GREENHOUSE: string[] = [
  'stripe','airbnb','coinbase','brex','plaid','figma','datadog','amplitude',
  'intercom','asana','lattice','gusto','airtable','discord','duolingo',
  'instacart','klaviyo','ramp','robinhood','scale-ai','toast','zendesk',
  'hubspot','mongodb','okta','pagerduty','squarespace','dropbox','benchling',
  'qualtrics','opendoor','calm','segment','cloudflare','miro-greenhouse',
  'etsy','pinterest-greenhouse','lyft-greenhouse','twilio','sendgrid',
  'mixpanel','zenefits','chime','faire','attentive','gong','highspot',
  'braze','contentful','figma','cockroach-labs','weights-biases',
];

export const LEVER: string[] = [
  'reddit','lyft','grammarly','canva','miro','loom','webflow',
  'retool','coda','netlify','quora','eventbrite','anduril',
  'benchling-lever','carta','dbt-labs-lever','figma-lever',
  'flexport','gem','gitlab','notion','scale','vercel-lever',
  'samsara','deel','rippling','mercury','brex-lever',
];

export const ASHBY: string[] = [
  'linear','vercel','render','supabase','posthog','modal',
  'turso','prefect','cal','dbtlabs','highlight','openai','anthropic',
  'mistral','perplexity','together-ai','anyscale','weights-biases-ashby',
  'cohere','hugging-face','stability-ai','character','inflection',
  'midjourney','runway','eleven-labs','luma-ai',
];

export const WORKABLE: string[] = [
  'typeform','mews','learnupon','aircall','workable',
  'beat','skroutz','hellas-direct','leroy-merlin-gr',
];

export const BREEZYHR: string[] = [
  'buffer','doist','remote','close','convertkit',
  'remote-com','basecamp-breezy',
];

export const RECRUITEE: string[] = [
  'mollie','mews-recruitee','sendcloud','picnic','lightspeed-recruitee',
  'messagebird','palo-it',
];

export const SMARTRECRUITERS: string[] = [
  'bosch','lidl','hilton','visa','equinix',
  'softchoice','talend','pricewaterhousecoopers',
];

export const JAZZHR: string[] = [
  'grubhub','1password','verizon-media',
];

export const TEAMTAILOR: string[] = [
  'klarna','trustly','pleo','schibsted','nansen',
];

export const PINPOINT: string[] = [
  'multiverse','sparta-global','decoded',
];

export const HOMERUN: string[] = [
  'lightspeed-pos','sendcloud-homerun','miele',
];

export const DOVER: string[] = [
  'dover','dover-sandbox',
];

/** All seeds combined — used when a scraper needs to try multiple companies */
export const ALL_SEEDS: Record<string, string[]> = {
  greenhouse:      GREENHOUSE,
  lever:           LEVER,
  ashby:           ASHBY,
  workable:        WORKABLE,
  breezyhr:        BREEZYHR,
  recruitee:       RECRUITEE,
  smartrecruiters: SMARTRECRUITERS,
  jazzhr:          JAZZHR,
  teamtailor:      TEAMTAILOR,
  pinpoint:        PINPOINT,
  homerun:         HOMERUN,
  dover:           DOVER,
};
