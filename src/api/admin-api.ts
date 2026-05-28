import type { AdminApiInterface } from "./admin-types"
import { USE_MOCK_API } from "@/lib/constants"
import { mockAdminApi } from "./mock/mock-admin-api"
import { realAdminApi } from "./real-admin-api"

export const adminApi: AdminApiInterface = USE_MOCK_API
  ? mockAdminApi
  : realAdminApi
