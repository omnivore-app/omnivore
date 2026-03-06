package redisutil

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/omnivore-app/omnivore/internal/config"
	"github.com/redis/go-redis/v9"
)

// RedisDataSource holds two Redis clients: one for caching and one for BullMQ queues.
type RedisDataSource struct {
	CacheClient *redis.Client
	MQClient    *redis.Client
}

func New(cfg *config.Config) (*RedisDataSource, error) {
	cacheClient, err := newClient(cfg.RedisURL, cfg.RedisCert)
	if err != nil {
		return nil, fmt.Errorf("cache redis: %w", err)
	}

	mqClient := cacheClient
	if cfg.MQRedisURL != "" {
		mqClient, err = newClient(cfg.MQRedisURL, cfg.MQRedisCert)
		if err != nil {
			return nil, fmt.Errorf("mq redis: %w", err)
		}
	}

	// Ping both
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := cacheClient.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("cache redis ping: %w", err)
	}
	if mqClient != cacheClient {
		if err := mqClient.Ping(ctx).Err(); err != nil {
			return nil, fmt.Errorf("mq redis ping: %w", err)
		}
	}

	log.Println("Redis connected")
	return &RedisDataSource{
		CacheClient: cacheClient,
		MQClient:    mqClient,
	}, nil
}

func newClient(redisURL, cert string) (*redis.Client, error) {
	if redisURL == "" {
		return nil, fmt.Errorf("redis URL is empty")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("parse redis URL: %w", err)
	}

	// TLS with custom cert for rediss:// URLs
	if strings.HasPrefix(redisURL, "rediss://") && cert != "" {
		opt.TLSConfig = &tls.Config{
			InsecureSkipVerify: true, //nolint:gosec // matches original TS behaviour
			RootCAs:            nil,
		}
	}

	// Match ioredis settings from original
	opt.DialTimeout = 10 * time.Second

	return redis.NewClient(opt), nil
}

func (r *RedisDataSource) Shutdown() {
	if err := r.CacheClient.Close(); err != nil {
		log.Printf("Error closing cache Redis: %v", err)
	}
	if r.MQClient != r.CacheClient {
		if err := r.MQClient.Close(); err != nil {
			log.Printf("Error closing MQ Redis: %v", err)
		}
	}
	log.Println("Redis shutdown complete")
}
