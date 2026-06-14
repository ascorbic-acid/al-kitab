export default class lStore {
    static read(key: string) : string | null {
        const res = localStorage.getItem(key)
        if(res) {
            return res
        } else {
            return null
        }
    }
    static write(key: string, data: string | null = null) {
        if (data === null) {
            console.log("custom storage remove: ", key);
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, data);
        }
    }
}