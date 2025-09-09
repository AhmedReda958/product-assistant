import { google } from "@ai-sdk/google";
import { streamText } from "ai";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    image: string;
  };
  images: string[];
}

interface Category {
  id: number;
  name: string;
  image: string;
}

interface MessagePart {
  type: string;
  text: string;
}

interface ChatMessage {
  role: string;
  content?: string;
  parts?: MessagePart[];
}

// Function to fetch categories
async function fetchCategories() {
  try {
    const categoriesRes = await fetch(
      "https://api.escuelajs.co/api/v1/categories"
    );
    const categories: Category[] = await categoriesRes.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Function to build filtered API URL based on user preferences
function buildProductsURL(filters: {
  title?: string;
  price?: number;
  price_min?: number;
  price_max?: number;
  categoryId?: number;
  categorySlug?: string;
  limit?: number;
  offset?: number;
}): string {
  const baseURL = "https://api.escuelajs.co/api/v1/products";
  const params = new URLSearchParams();

  if (filters.title) params.append("title", filters.title);
  if (filters.price) params.append("price", filters.price.toString());
  if (filters.price_min)
    params.append("price_min", filters.price_min.toString());
  if (filters.price_max)
    params.append("price_max", filters.price_max.toString());
  if (filters.categoryId)
    params.append("categoryId", filters.categoryId.toString());
  if (filters.categorySlug) params.append("categorySlug", filters.categorySlug);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());

  return params.toString() ? `${baseURL}?${params.toString()}` : baseURL;
}

// Function to fetch filtered products
async function fetchFilteredProducts(
  filters: Parameters<typeof buildProductsURL>[0]
) {
  try {
    const url = buildProductsURL(filters);
    const response = await fetch(url);
    const products: Product[] = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return [];
  }
}

// Function to extract text content from message parts
function extractTextFromMessage(message: ChatMessage): string {
  if (message.content) {
    return message.content;
  }
  if (message.parts) {
    return message.parts
      .filter((part: MessagePart) => part.type === "text")
      .map((part: MessagePart) => part.text)
      .join("");
  }
  return "";
}

// Function to analyze conversation and extract user preferences
function analyzeConversation(messages: ChatMessage[]): {
  shouldAskQuestion: boolean;
  shouldShowProducts: boolean;
  filters: Parameters<typeof buildProductsURL>[0];
  missingCriticalInfo: string | null;
} {
  const conversation = messages
    .map((m) => extractTextFromMessage(m))
    .join(" ")
    .toLowerCase();
  const filters: Parameters<typeof buildProductsURL>[0] = { limit: 3 }; // Max 3 products

  // Extract price preferences
  const priceMatch = conversation.match(/\$?(\d+)/);
  const priceRangeMatch = conversation.match(
    /between \$?(\d+) and \$?(\d+)|under \$?(\d+)|over \$?(\d+)|less than \$?(\d+)|more than \$?(\d+)|budget.*?(\d+)|around.*?(\d+)/
  );

  if (priceRangeMatch) {
    if (priceRangeMatch[1] && priceRangeMatch[2]) {
      filters.price_min = parseInt(priceRangeMatch[1]);
      filters.price_max = parseInt(priceRangeMatch[2]);
    } else if (priceRangeMatch[3]) {
      filters.price_max = parseInt(priceRangeMatch[3]);
    } else if (priceRangeMatch[4] || priceRangeMatch[6]) {
      filters.price_min = parseInt(priceRangeMatch[4] || priceRangeMatch[6]);
    } else if (priceRangeMatch[5]) {
      filters.price_max = parseInt(priceRangeMatch[5]);
    } else if (priceRangeMatch[7] || priceRangeMatch[8]) {
      // Budget or around price
      const budgetPrice = parseInt(priceRangeMatch[7] || priceRangeMatch[8]);
      filters.price_max = budgetPrice;
    }
  } else if (priceMatch && !conversation.includes("id")) {
    filters.price = parseInt(priceMatch[1]);
  }

  // Extract category preferences (more comprehensive)
  const categoryMappings = {
    clothes: [
      "clothes",
      "clothing",
      "shirt",
      "pants",
      "dress",
      "jacket",
      "fashion",
    ],
    electronics: [
      "electronics",
      "phone",
      "laptop",
      "computer",
      "tech",
      "gadget",
    ],
    furniture: ["furniture", "chair", "table", "desk", "sofa", "bed"],
    shoes: ["shoes", "sneakers", "boots", "footwear"],
    miscellaneous: ["misc", "other", "general"],
  };

  let foundCategory = null;
  for (const [category, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some((keyword) => conversation.includes(keyword))) {
      foundCategory = category;
      break;
    }
  }
  if (foundCategory) {
    filters.categorySlug = foundCategory;
  }

  // Extract product title/name preferences (more flexible)
  const productKeywords = conversation.match(
    /(?:looking for|want|need|find|buy|purchase|get|show me|recommend)\s+([\w\s]+?)(?:\s|$|for|with|under|over|\?|\.)/i
  );
  if (productKeywords) {
    const keyword = productKeywords[1]?.trim();
    if (
      keyword &&
      keyword.length > 2 &&
      !Object.values(categoryMappings).flat().includes(keyword.toLowerCase())
    ) {
      filters.title = keyword;
    }
  }

  // Determine if we should ask a question or show products
  const hasAnyPreference =
    filters.categorySlug ||
    filters.title ||
    filters.price ||
    filters.price_min ||
    filters.price_max;
  const isFirstMessage = messages.length <= 1;
  const hasAskedQuestion = messages.some(
    (m) => m.role === "assistant" && extractTextFromMessage(m).includes("?")
  );

  let shouldAskQuestion = false;
  let shouldShowProducts = true;
  let missingCriticalInfo = null;

  // Only ask ONE question if it's the first interaction and no clear preference
  if (isFirstMessage && !hasAnyPreference) {
    shouldAskQuestion = true;
    shouldShowProducts = false;
    missingCriticalInfo = "What type of product are you looking for today?";
  } else if (!hasAskedQuestion && !hasAnyPreference) {
    // If we haven't asked a question yet and still no preference, ask one
    shouldAskQuestion = true;
    shouldShowProducts = false;
    missingCriticalInfo =
      "What category of products interests you? (clothes, electronics, furniture, etc.)";
  } else {
    // Show products - either we have preferences or we've already asked
    shouldShowProducts = true;
    shouldAskQuestion = false;
  }

  return {
    shouldAskQuestion,
    shouldShowProducts,
    filters,
    missingCriticalInfo,
  };
}

// Function to format product as markdown card
function formatProductCard(product: Product): string {
  const productUrl = `https://api.escuelajs.co/api/v1/products/${product.id}`;
  const imageUrl = product.images[0] || "/placeholder-product.jpg";
  const description =
    product.description.length > 100
      ? product.description.substring(0, 100) + "..."
      : product.description;

  return `
## [${product.title}](${productUrl})

![${product.title}](${imageUrl})

**Category:** ${product.category.name}  
**Price:** $${product.price}

${description}

[🔗 View Product Details](${productUrl})

---
`;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message
  const lastMessage = messages[messages.length - 1];
  const userQuery = extractTextFromMessage(lastMessage) || "";

  // Analyze conversation to understand user preferences
  const {
    shouldAskQuestion,
    shouldShowProducts,
    filters,
    missingCriticalInfo,
  } = analyzeConversation(messages);

  let productCardsHtml = "";
  let systemContext = "";

  if (shouldAskQuestion && missingCriticalInfo) {
    // Ask one question only
    const categories = await fetchCategories();
    const categoryList = categories.map((cat) => `• ${cat.name}`).join("\n");
    systemContext = `Available product categories:\n${categoryList}\n\nQuestion to ask: ${missingCriticalInfo}`;
  } else if (shouldShowProducts) {
    // Show products based on available preferences
    let products = await fetchFilteredProducts(filters);

    if (products.length === 0) {
      // Try broader search if no exact matches
      const broaderFilters = { ...filters };
      delete broaderFilters.price;
      delete broaderFilters.title;

      if (Object.keys(broaderFilters).length > 1) {
        products = await fetchFilteredProducts(broaderFilters);
      }

      // If still no results, get popular products from a random category
      if (products.length === 0) {
        const categories = await fetchCategories();
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];
        products = await fetchFilteredProducts({
          categoryId: randomCategory.id,
          limit: 3,
        });
      }
    }

    // Limit to max 3 products
    products = products.slice(0, 3);

    if (products.length > 0) {
      productCardsHtml = products.map(formatProductCard).join("\n");
      systemContext = `Showing ${products.length} product recommendations with images and links.`;
    } else {
      systemContext = "Let me show you some popular products.";
    }
  }

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: `You are an AI ecommerce product assistant that helps customers quickly find products.

**CONVERSATION FLOW:**
${
  shouldAskQuestion
    ? `
**ASK ONE QUESTION ONLY:**
Ask the specific question provided in the context, then move to recommendations.
Be brief and friendly. Don't ask multiple questions.
`
    : `
**SHOW PRODUCT RECOMMENDATIONS:**
Present 2-3 product recommendations with images and clickable links.
- The products are already formatted with images and links
- Briefly explain why each product fits their needs
- Mention key features and value
- Be concise and helpful
- Ask if they want to see alternatives or have questions about any product
`
}

**RESPONSE STYLE:**
- Keep responses SHORT and direct
- Maximum 1 question, then show products
- Show only 2-3 products maximum
- Be friendly and conversational
- Focus on what matters most

**CURRENT CONTEXT:**
${systemContext}`,
    messages: [
      ...messages.slice(0, -1).map((msg: ChatMessage) => ({
        role: msg.role,
        content: extractTextFromMessage(msg),
      })),
      {
        role: "user",
        content: `${userQuery}\n\n${
          productCardsHtml
            ? `Here are the product recommendations:\n\n${productCardsHtml}`
            : ""
        }`,
      },
    ],
  });

  return result.toUIMessageStreamResponse();
}
