

// database singleton
import { PGlite, IdbFs } from '@electric-sql/pglite'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { openDB, deleteDB, wrap, unwrap } from 'idb';



export default class AppDB {
    private static _instance: AppDB;
    private db?: PGlite;

    private constructor(){
        this.init()
    }

    public static Instance() {
        if (!this._instance) {
            this._instance = new AppDB();
        }
        return this._instance;
    }

    public getDB(): PGlite {
        return this.db!;
    }

    public async init() {
        // init or load existing db
        this.db = new PGlite('idb://alkitab_db', { extensions: { pg_trgm } });
        this.createDBSinglesTable();
        console.log("AppDB initialized");
        
    }

    public createDBSinglesTable() {
        this.db!.exec(`
            CREATE TABLE IF NOT EXISTS Singles (id INTEGER PRIMARY KEY, name TEXT, json JSONB);
            INSERT INTO Singles (id, name, json) VALUES (1, 'settings', '{}') ON CONFLICT (id) DO NOTHING;
        `);
    }

    public async setSettingsValue(key: string, value: any) {
        return await this.db!.exec(`
            UPDATE Singles SET json = jsonb_set(json, '{${key}}', to_jsonb('${value}'::text), true) WHERE id = 1;
        `,);
    }

    public async getSettingsValue<T>(key: string): Promise<T | null> {
        const res = await this.db!.query(`
            SELECT json->'${key}' AS value FROM Singles WHERE id = 1;
        `);
        return res.rows[0]? res.rows[0].value! : null;
    }

    public async getAllSettings(): Promise<Object | null> {
        const res = await this.db!.query(`
            SELECT json AS value FROM Singles WHERE id = 1;
        `);
        return res.rows[0]? res.rows[0].value! : null;
    }

}

