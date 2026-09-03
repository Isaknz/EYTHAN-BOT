const rateLimits = new Map();

class RateLimiter {
    constructor() {
        this.limits = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 600000); // Limpieza cada 10 min
    }

    checkLimit(userId, command, maxRequests = 5, windowMs = 60000) {
        const key = `${userId}:${command}`;
        const now = Date.now();
        
        if (!this.limits.has(key)) {
            this.limits.set(key, { 
                count: 1, 
                resetTime: now + windowMs,
                firstRequest: now 
            });
            return { allowed: true, remaining: maxRequests - 1 };
        }
        
        const limit = this.limits.get(key);
        
        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + windowMs;
            limit.firstRequest = now;
            return { allowed: true, remaining: maxRequests - 1 };
        }
        
        if (limit.count >= maxRequests) {
            const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
            return { 
                allowed: false, 
                remaining: 0, 
                retryAfter,
                message: `⏳ Espera ${retryAfter}s antes de usar este comando de nuevo.`
            };
        }
        
        limit.count++;
        return { 
            allowed: true, 
            remaining: maxRequests - limit.count 
        };
    }

    getStatus(userId, command, maxRequests = 5) {
        const key = `${userId}:${command}`;
        const limit = this.limits.get(key);
        
        if (!limit) return { count: 0, remaining: maxRequests };
        return { 
            count: limit.count, 
            remaining: Math.max(0, maxRequests - limit.count) 
        };
    }

    cleanup() {
        const now = Date.now();
        for (const [key, limit] of this.limits.entries()) {
            if (now > limit.resetTime + 300000) { // Borrar después de 5 min de expirado
                this.limits.delete(key);
            }
        }
    }

    reset(userId, command) {
        const key = `${userId}:${command}`;
        this.limits.delete(key);
    }

    resetAllUser(userId) {
        for (const key of this.limits.keys()) {
            if (key.startsWith(`${userId}:`)) {
                this.limits.delete(key);
            }
        }
    }
}

module.exports = new RateLimiter();