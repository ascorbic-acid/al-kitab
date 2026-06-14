import type Locator from "~/workers/core/locator";

export interface IService {
    serviceMember(): void; //This void method is for check the interface on Locator.ts. Implement it and leave it empty
    init(sl: Locator): void;
    dispose(): void;
}