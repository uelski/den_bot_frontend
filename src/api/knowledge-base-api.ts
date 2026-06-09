import { USE_MOCK_API } from "@/lib/constants"
import type { KnowledgeBaseApiInterface } from "./knowledge-base-types"
import { mockKnowledgeBaseApi } from "./mock/mock-knowledge-base-api"
import { realKnowledgeBaseApi } from "./real-knowledge-base-api"

export const knowledgeBaseApi: KnowledgeBaseApiInterface = USE_MOCK_API
  ? mockKnowledgeBaseApi
  : realKnowledgeBaseApi
