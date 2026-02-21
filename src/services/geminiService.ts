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
    Generate a comprehensive, executive-grade Sales Intelligence Report.
    
    SELLER:
    Name: ${seller.name}
    Role: ${seller.jobProfile}
    Company: ${seller.company} (${seller.website})
    Industry: ${seller.industry}
    Product: ${seller.productFocus}
    Value Prop: ${seller.valueProp}
    
    BUYER:
    Name: ${buyer.name}
    Title: ${buyer.jobTitle}
    Company: ${buyer.company} (${buyer.website})
    Industry: ${buyer.industry}
    Pain Points: ${buyer.painPoints}
    
    Follow the exact structure defined in the requirements:
    SECTION 1 — BUYER SNAPSHOT (Executive Summary)
    SECTION 2 — BUYER DEEP DIVE (Professional, Psychological, Decision Framework, Priority Signals)
    SECTION 3 — SELLER POSITIONING (Credibility, Fit, Trust Bridge, Outreach Strategy)
    SECTION 4 — COMPANY & MARKET INTELLIGENCE
    SECTION 5 — COMPETITIVE INTELLIGENCE
    SECTION 6 — PAIN POINT ANALYSIS (Explicit vs Inferred)
    SECTION 7 — OBJECTION HANDLING PLAYBOOK
    SECTION 8 — DEAL EXECUTION STRATEGY
    SECTION 9 — PERSONALIZED OUTREACH (Email, LinkedIn, Discovery Questions)
    
    STYLE: McKinsey + Top Sales Strategist. Insight-dense. Professional. No fluff. No emojis.
    Use "Inference:", "Likely:", "Signal suggests:" for non-verified data.
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
