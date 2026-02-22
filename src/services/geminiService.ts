import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export interface SellerInfo {
  name: string;
  jobProfile: string;
  company: string;
  website: string;
  industry: string;
  linkedinUrl: string;
  productFocus: string;
  valueProp: string;
}

export interface BuyerInfo {
  name: string;
  jobTitle: string;
  company: string;
  industry: string;
  painPoints: string;
  linkedinUrl: string;
  website: string;
}

export const initialSeller: SellerInfo = {
  name: "",
  jobProfile: "",
  company: "",
  website: "",
  industry: "",
  linkedinUrl: "",
  productFocus: "",
  valueProp: "",
};

export const initialBuyer: BuyerInfo = {
  name: "",
  jobTitle: "",
  company: "",
  industry: "",
  painPoints: "",
  linkedinUrl: "",
  website: "",
};

export async function fetchAutofillData(urls: string[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const prompt = `
    Analyze the following URLs and extract structured information for a sales intelligence tool.
    URLs: ${urls.join(", ")}
    
    Extract or infer:
    - For the Seller (if applicable): Name, Role, Company, Industry, ICP, Messaging, Product Positioning.
    - For the Buyer (if applicable): Name, Job Title, Company, Industry, Market Position, Strategic Initiatives.
    
    Return a JSON object with 'seller' and 'buyer' keys containing the extracted fields.
    If a field is inferred, mark it as such.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ urlContext: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seller: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              jobProfile: { type: Type.STRING },
              company: { type: Type.STRING },
              industry: { type: Type.STRING },
              website: { type: Type.STRING },
              productFocus: { type: Type.STRING },
              valueProp: { type: Type.STRING },
            }
          },
          buyer: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              jobTitle: { type: Type.STRING },
              company: { type: Type.STRING },
              industry: { type: Type.STRING },
              website: { type: Type.STRING },
              painPoints: { type: Type.STRING },
            }
          },
          confidence: { type: Type.NUMBER }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateDeepReport(seller: SellerInfo, buyer: BuyerInfo) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const prompt = `
    Generate a PREMIUM EXECUTIVE SALES INTELLIGENCE REPORT.
    
    SELLER:
    Name: ${seller.name} | Role: ${seller.jobProfile} | Company: ${seller.company}
    Product: ${seller.productFocus} | Value Prop: ${seller.valueProp}
    
    BUYER:
    Name: ${buyer.name} | Title: ${buyer.jobTitle} | Company: ${buyer.company}
    Industry: ${buyer.industry} | Stated Pain Points: ${buyer.painPoints}
    
    REPORT REQUIREMENTS:
    
    1. STYLE & FORMATTING:
    - Tone: McKinsey Partner + Elite Sales Strategist.
    - Zero fluff. High insight density.
    - Use Markdown for structure.
    - Use strategic callout boxes using blockquotes with specific prefixes:
      - > [!KEY_INSIGHT] for critical takeaways.
      - > [!HIDDEN_RISK] for non-obvious threats.
      - > [!TACTICAL_EDGE] for specific advantages.
    - Use bold emphasis for critical terms.
    - Use tables for comparisons where appropriate.

    2. MANDATORY SECTIONS:
    
    SECTION 1: EXECUTIVE SNAPSHOT
    - Leadership Archetype & Communication Posture.
    - Win Probability Analysis (Likelihood % based on inertia, alignment, category maturity).
    - Timing Intelligence (Entry windows, urgency triggers).

    SECTION 2: BUYER COGNITIVE & PSYCHOLOGICAL PROFILE
    - Archetype Classification: Choose one (Empire Builder, Systems Thinker, Visionary Operator, Institutional Guardian, Pragmatic Optimizer) and explain WHY based on career trajectory.
    - Ego Drivers: Identity protection, status sensitivities, public vs private self.
    - Cognitive Bias Map: Decision biases (e.g., Loss Aversion, Status Quo Bias), risk framing style.
    - Emotional Triggers: Energizing vs. Resistance-creating language.
    - Identity Threat Zones: Positioning to avoid.

    SECTION 3: DECISION POWER & STAKEHOLDER MAP
    - Hidden Stakeholder Map: Likely influencers, blockers, and silent veto holders.
    - Power Graph: Economic buyer, Technical buyer, Political gatekeepers, Budget controllers.
    - Influence Relationships: Who influences whom, alignment clusters, friction zones.
    - Access Strategy: Who to approach first, who validates credibility, who accelerates.
    - Blocker Prediction: Roles likely to stall, root cause of resistance, neutralization strategies.

    SECTION 4: BUYING COMMITTEE SIMULATION
    - Predict reactions by role (IT, Finance, Operations, Legal).
    - Simulated objection handling by role.

    SECTION 5: RISK SURFACE MAPPING
    - Strategic, Political, Budget Cycle, and Timing risks.

    SECTION 6: SELLER POSITIONING & OUTREACH PLAYBOOK
    - Message-Market Fit & Psychological Overlap.
    - Personalized Outreach: First email, LinkedIn message, Discovery questions.
    - Executive Meeting Framing.

    INFERENCE RULES:
    - Use behavioral inference based on company scale and industry norms.
    - Label non-verified data with "Inference:", "Likely:", or "Signal suggests:".
    - Never fabricate fake citations.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ urlContext: {} }]
    }
  });

  return response.text;
}
