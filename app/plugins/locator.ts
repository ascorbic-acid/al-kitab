import { defineNuxtPlugin } from '#app';
import { SettingsService }  from '~/services/settings_service';
import IDBService  from '~/services/idb_service';
import ServiceLocator from '~/services/locator';



export default defineNuxtPlugin(() => {
    const sl = ServiceLocator.Instance
    // const idbSvc = sl.RegisterInstance(new IDBService());
    sl.Register<IDBService>(IDBService)
    // const settings = sl.RegisterInstance(new SettingsService(sl.GetService(IDBService)!));


    console.log(sl.GetService(SettingsService));
    
    // Register other services here:
    // serviceLocator.register(AppConfig, AppConfig.getInstance());

    return {
        provide: {
            // Provide the service locator instance as a global property on the Nuxt app context.
            // Use a distinct name like 'sl' or 'services' to avoid conflicts.
            sl: sl,
        },
    };
});