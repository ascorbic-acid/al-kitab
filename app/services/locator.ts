

export interface IService {
    serviceMember(): void; //This void method is for check the interface on ServiceLocator.ts. Implement it and leave it empty
    initSvc(sl: ServiceLocator): void;
    disposeSvc(): void;
}

export default class ServiceLocator {
    private static _instance: ServiceLocator;
    private services: Map<Function, object> = new Map();
    private requests: Map<Function, Array<(service: object) => void>> = new Map();

    private constructor() {}

    public static get Instance(): ServiceLocator {
        if (!this._instance) {
            this._instance = new ServiceLocator();
        }
        return this._instance;
    }

    public Register<T extends IService>(ServiceType: new () => T): T {
        if (!this.services.has(ServiceType)) {
            const instance = new ServiceType();
            this.services.set(ServiceType, instance);
            instance.initSvc(this);
            this.ResolvePendingRequest(ServiceType, instance);
            return instance;
        } else {
            console.error(`[ServiceLocator] Service already registered: ${ServiceType.name}`);
            return this.services.get(ServiceType) as T;
        }
    }

    public RegisterInstance<T extends object>(instance: T): void {
        const type = instance.constructor;
        if (!this.services.has(type)) {
            this.services.set(type, instance);
            this.ResolvePendingRequest(type, instance);
        } else {
            console.error(`[ServiceLocator] Instance already registered: ${type.name}`);
        }
    }

    public RegisterFactory<T extends IService>(
        ServiceType: new (...args: any[]) => T,
        factory: () => T
    ): T {
        if (!this.services.has(ServiceType)) {
            const instance = factory();
            this.services.set(ServiceType, instance);
            instance.initSvc(this);
            this.ResolvePendingRequest(ServiceType, instance);
            return instance;
        } else {
            console.error(`[ServiceLocator] Factory service already registered: ${ServiceType.name}`);
            return this.services.get(ServiceType) as T;
        }
    }

    public GetService<T>(ServiceType: new (...args: any[]) => T): T | null {
        return (this.services.get(ServiceType) as T) || null;
    }

    public WaitForService<T>(
        ServiceType: new (...args: any[]) => T,
        callback: (service: T) => void
    ) {
        const service = this.services.get(ServiceType) as T;
        if (service) {
            callback(service);
        } else {
            if (!this.requests.has(ServiceType)) {
                this.requests.set(ServiceType, []);
            }
            this.requests.get(ServiceType)!.push(callback as (service: object) => void);
        }
    }

    public disposeSvc<T extends IService>(ServiceType: new (...args: any[]) => T): void {
        const service = this.services.get(ServiceType);
        if (service && this.IsInstanceOfService(service)) {
            (service as IService).disposeSvc();
            this.services.delete(ServiceType);
        }
    }

    public disposeSvcAllServices(): void {
        for (const [key, service] of this.services.entries()) {
            if (this.IsInstanceOfService(service)) {
                (service as IService).disposeSvc();
            }
            this.services.delete(key);
        }
    }

    private ResolvePendingRequest<T>(ServiceType: Function, instance: T) {
        const callbacks = this.requests.get(ServiceType);
        if (callbacks) {
            callbacks.forEach(cb => cb(instance));
            this.requests.delete(ServiceType);
        }
    }

    private IsInstanceOfService(service: any): service is IService {
        return typeof service.serviceMember === 'function';
    }
}
