class SimpleCacheRecord{
    constructor(timeout, fetcher) {
        this.timeout = timeout;
        this.fetcher = fetcher;
        this.value = null;
        this.lastUpdate = null;

    }

    async getOrFetch() {
        if(!this.value || !this.lastUpdate || (this.lastUpdate - Date.now()) > this.timeout){
            this.value = await this.fetcher();
            this.lastUpdate = Date.now();
        }

        return this.value;
    }
}

module.exports = SimpleCacheRecord;