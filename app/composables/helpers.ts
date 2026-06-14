import type { IService } from "~/models/locator/locator_iservice"
import type Locator from "~/services/locator"

export const useSGet = <T extends IService>(ServiceType: new (...args: any[]) => T): T => {
  const sl = (window as any)["sl"] as Locator
  const service = sl.get(ServiceType)
  if (service === null) {
    throw new Error(`Service not found for identifier: ${ServiceType.name}`)
  }
  return service
}