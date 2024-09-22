import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export function getCachedData<T>(key: string, fetchData: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const cachedData = cache.get<T>(key);
        if (cachedData) {
            resolve(cachedData);
        } else {
            fetchData()
                .then((data) => {
                    cache.set(key, data);
                    resolve(data);
                })
                .catch(reject);
        }
    });
}