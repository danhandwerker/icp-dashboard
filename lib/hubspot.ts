const HUBSPOT_BASE = "https://api.hubapi.com";
const ADS_PIPELINE_ID = "eeca8243-f742-449f-b61f-71b6d7a10059";
const HUBSPOT_PORTAL_ID = "2187456";

export interface HubSpotEnrichment {
  found: boolean;
  companyId?: string;
  companyName?: string;
  domain?: string;
  isExistingCustomer: boolean;
  productStatus: Record<string, string>;
  dealData?: {
    dealId: string;
    dealName: string;
    amount: number | null;
    stage: string;
    ctlMethod: string | null;
    technology: string | null;
  };
  suggestedDimensions: {
    budget?: { score: number; label: string; rationale: string };
    data_integration?: { score: number; label: string; rationale: string };
  };
  hubspotUrl?: string;
}

function getToken(): string | null {
  return process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? null;
}

function mapAmountToBudget(amount: number | null): {
  score: number;
  label: string;
  rationale: string;
} | undefined {
  if (amount === null || amount <= 0) return undefined;
  if (amount >= 300_000) {
    return {
      score: 12,
      label: "$300k+ test with performance guarantee",
      rationale: `Deal amount $${amount.toLocaleString()} from HubSpot CRM`,
    };
  }
  if (amount >= 100_000) {
    return {
      score: 10,
      label: "$100-300k, 60+ day runway",
      rationale: `Deal amount $${amount.toLocaleString()} from HubSpot CRM`,
    };
  }
  if (amount >= 50_000) {
    return {
      score: 8,
      label: "$50-100k, 30-60 days",
      rationale: `Deal amount $${amount.toLocaleString()} from HubSpot CRM`,
    };
  }
  if (amount >= 20_000) {
    return {
      score: 5,
      label: "$20-50k, 30+ days",
      rationale: `Deal amount $${amount.toLocaleString()} from HubSpot CRM`,
    };
  }
  return {
    score: 2,
    label: "<$20k or <30 days",
    rationale: `Deal amount $${amount.toLocaleString()} from HubSpot CRM`,
  };
}

function mapCtlToDataIntegration(ctlMethod: string | null): {
  score: number;
  label: string;
  rationale: string;
} | undefined {
  if (!ctlMethod) return undefined;
  const ctl = ctlMethod.toLowerCase();
  const hasS2S = ctl.includes("s2s") || ctl.includes("server");
  const hasCdp = ctl.includes("cdp");
  const hasPixel = ctl.includes("pixel");

  if (hasS2S && hasCdp) {
    return {
      score: 12,
      label: "S2S + CDP + strong CTL",
      rationale: `CTL method "${ctlMethod}" from HubSpot CRM`,
    };
  }
  if (hasS2S || hasCdp) {
    return {
      score: 10,
      label: "S2S or CDP with good event coverage",
      rationale: `CTL method "${ctlMethod}" from HubSpot CRM`,
    };
  }
  if (hasPixel) {
    return {
      score: 7,
      label: "Standard pixel + conversion tracking",
      rationale: `CTL method "${ctlMethod}" from HubSpot CRM`,
    };
  }
  return {
    score: 3,
    label: "Basic web analytics only",
    rationale: `CTL method "${ctlMethod}" from HubSpot CRM (no recognized integration type)`,
  };
}

interface HubSpotCompany {
  id: string;
  properties: Record<string, string | null>;
}

interface HubSpotDeal {
  id: string;
  properties: Record<string, string | null>;
}

async function searchCompanyByName(
  name: string,
  token: string
): Promise<HubSpotCompany | null> {
  const res = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/companies/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "name",
              operator: "CONTAINS_TOKEN",
              value: name,
            },
          ],
        },
      ],
      properties: [
        "name",
        "domain",
        "industry",
        "annualrevenue",
        "numberofemployees",
        "flag___acquire_customer_status",
        "flag___current_commerce_customer",
        "flag___payments_marketplace_customer_status",
        "flag___mparticle_customer_status",
        "catalog_client_status",
        "n3p_afterselll_client_status",
        "upcart_client_status",
      ],
      limit: 5,
    }),
  });

  if (!res.ok) {
    throw new Error(`HubSpot company search failed: ${res.status}`);
  }

  const data = (await res.json()) as { results: HubSpotCompany[] };
  if (!data.results || data.results.length === 0) return null;

  // Pick the best match: prefer exact name match, otherwise take first result
  const nameLower = name.toLowerCase();
  const exact = data.results.find(
    (c) => (c.properties.name ?? "").toLowerCase() === nameLower
  );
  return exact ?? data.results[0];
}

async function getAssociatedDealIds(
  companyId: string,
  token: string
): Promise<string[]> {
  const res = await fetch(
    `${HUBSPOT_BASE}/crm/v3/objects/companies/${companyId}/associations/deals`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return [];

  const data = (await res.json()) as {
    results: { id: string; type: string }[];
  };
  return (data.results ?? []).map((r) => r.id);
}

async function batchFetchDeals(
  dealIds: string[],
  token: string
): Promise<HubSpotDeal[]> {
  if (dealIds.length === 0) return [];

  const res = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/deals/batch/read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: dealIds.map((id) => ({ id })),
      properties: [
        "dealname",
        "amount",
        "dealstage",
        "pipeline",
        "integration___close_the_loop_method",
        "seed_suppression_integration_methods",
        "campaign_strategy",
      ],
    }),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { results: HubSpotDeal[] };
  return data.results ?? [];
}

function pickBestDeal(deals: HubSpotDeal[]): HubSpotDeal | null {
  if (deals.length === 0) return null;

  // Filter to Ads pipeline only
  const adsDeals = deals.filter(
    (d) => d.properties.pipeline === ADS_PIPELINE_ID
  );
  const candidates = adsDeals.length > 0 ? adsDeals : deals;

  // Prefer deals with an amount, then take the largest
  const withAmount = candidates
    .filter((d) => d.properties.amount && Number(d.properties.amount) > 0)
    .sort(
      (a, b) => Number(b.properties.amount ?? 0) - Number(a.properties.amount ?? 0)
    );

  return withAmount[0] ?? candidates[0];
}

export async function lookupHubSpotBrand(
  brandName: string
): Promise<HubSpotEnrichment> {
  const token = getToken();

  if (!token) {
    return { found: false, isExistingCustomer: false, productStatus: {}, suggestedDimensions: {} };
  }

  try {
    const company = await searchCompanyByName(brandName, token);

    if (!company) {
      return { found: false, isExistingCustomer: false, productStatus: {}, suggestedDimensions: {} };
    }

    const props = company.properties;

    // Product status flags
    const productStatus: Record<string, string> = {};
    const productFields: Record<string, string> = {
      Ads: "flag___acquire_customer_status",
      Thanks: "flag___current_commerce_customer",
      "Pay+": "flag___payments_marketplace_customer_status",
      mParticle: "flag___mparticle_customer_status",
      Catalog: "catalog_client_status",
      AfterSell: "n3p_afterselll_client_status",
      Upcart: "upcart_client_status",
    };
    for (const [product, field] of Object.entries(productFields)) {
      const val = props[field];
      if (val) productStatus[product] = val;
    }

    // Is existing Rokt Ads customer?
    const adsStatus = (props["flag___acquire_customer_status"] ?? "").toLowerCase();
    const isExistingCustomer =
      adsStatus === "active" ||
      adsStatus === "live" ||
      adsStatus.includes("active") ||
      adsStatus.includes("live");

    // Fetch associated deals
    const dealIds = await getAssociatedDealIds(company.id, token);
    const allDeals = await batchFetchDeals(dealIds.slice(0, 20), token);
    const bestDeal = pickBestDeal(allDeals);

    let dealData: HubSpotEnrichment["dealData"] | undefined;
    if (bestDeal) {
      dealData = {
        dealId: bestDeal.id,
        dealName: bestDeal.properties.dealname ?? "",
        amount: bestDeal.properties.amount ? Number(bestDeal.properties.amount) : null,
        stage: bestDeal.properties.dealstage ?? "",
        ctlMethod: bestDeal.properties.integration___close_the_loop_method ?? null,
        technology: bestDeal.properties.seed_suppression_integration_methods ?? null,
      };
    }

    // Map to dimension suggestions
    const budgetSuggestion = mapAmountToBudget(dealData?.amount ?? null);
    const dataIntSuggestion = mapCtlToDataIntegration(dealData?.ctlMethod ?? null);

    const suggestedDimensions: HubSpotEnrichment["suggestedDimensions"] = {};
    if (budgetSuggestion) suggestedDimensions.budget = budgetSuggestion;
    if (dataIntSuggestion) suggestedDimensions.data_integration = dataIntSuggestion;

    return {
      found: true,
      companyId: company.id,
      companyName: props.name ?? brandName,
      domain: props.domain ?? undefined,
      isExistingCustomer,
      productStatus,
      dealData,
      suggestedDimensions,
      hubspotUrl: `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL_ID}/record/0-2/${company.id}`,
    };
  } catch (err) {
    console.error("HubSpot lookup error:", err);
    return { found: false, isExistingCustomer: false, productStatus: {}, suggestedDimensions: {} };
  }
}
