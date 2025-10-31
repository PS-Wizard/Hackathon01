import PocketBase from 'pocketbase';

const PB_URL = 'http://127.0.0.1:8090';

export function createPocketBase() {
    return new PocketBase(PB_URL);
}
