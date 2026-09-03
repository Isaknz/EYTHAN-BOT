const EventEmitter = require('events');

class MessageQueue extends EventEmitter {
    constructor(options = {}) {
        super();
        this.queue = [];
        this.processing = false;
        this.delay = options.delay || 1000;
        this.maxRetries = options.maxRetries || 3;
        this.concurrent = options.concurrent || 1;
        this.running = new Set();
        this.stats = {
            processed: 0,
            failed: 0,
            retries: 0
        };
    }

    add(task, priority = 0) {
        return new Promise((resolve, reject) => {
            const item = {
                task,
                priority,
                resolve,
                reject,
                retries: 0,
                added: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            };

            // Insertar según prioridad
            const index = this.queue.findIndex(i => i.priority < priority);
            if (index === -1) {
                this.queue.push(item);
            } else {
                this.queue.splice(index, 0, item);
            }

            this.emit('added', item);
            this.process();
        });
    }

    async process() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0 || this.running.size > 0) {
            while (this.running.size < this.concurrent && this.queue.length > 0) {
                const item = this.queue.shift();
                this.execute(item);
            }
            
            if (this.queue.length > 0 || this.running.size > 0) {
                await this.sleep(100);
            }
        }

        this.processing = false;
    }

    async execute(item) {
        this.running.add(item.id);
        this.emit('started', item);

        try {
            const result = await item.task();
            this.stats.processed++;
            item.resolve(result);
            this.emit('completed', item, result);
        } catch (error) {
            item.retries++;
            
            if (item.retries < this.maxRetries) {
                this.stats.retries++;
                this.emit('retry', item, error);
                
                // Esperar antes de reintentar (backoff exponencial)
                await this.sleep(Math.pow(2, item.retries) * 1000);
                this.queue.unshift(item);
            } else {
                this.stats.failed++;
                item.reject(error);
                this.emit('failed', item, error);
            }
        } finally {
            this.running.delete(item.id);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clear() {
        const cleared = this.queue.length;
        this.queue = [];
        return cleared;
    }

    getStats() {
        return {
            ...this.stats,
            pending: this.queue.length,
            running: this.running.size
        };
    }

    getStatus() {
        return {
            isProcessing: this.processing,
            queueLength: this.queue.length,
            running: this.running.size,
            stats: this.stats
        };
    }
}

// Instancia global
module.exports = new MessageQueue({
    delay: 1500,        // 1.5s entre mensajes
    maxRetries: 3,
    concurrent: 2       // 2 mensajes simultáneos máximo
});