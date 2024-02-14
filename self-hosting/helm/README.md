# Deployment using Helm

Helm chart to self-host Omnivore.

## Notes and General Information

This helm chart uses docker images from [`sejaeger/omnivore-*`](https://hub.docker.com/u/sejaeger). If you want to use the Web-UI or build your own images, checkout `../.build-and-push-images.sh`. You will find some hard-coded environment variables (e.g., `PG_DB` or `PG_USER`), please don't change them! Those are also hard-coded in the code base and changing them will likely cause problems. Please have a look at [the values file](values.yaml) and [change it accordingly](https://github.com/bjw-s/helm-charts/blob/main/charts/library/common/values.yaml) to your setup, especially: postgres hostname, omnivore URL.

Omnivore requires Postgres (+vector extension!) to store its information. Please make sure to have it up and running. Using the bitnami Helm charts works perfectly fine but you need to use a custom built image that contains the vector extension: [See this descriptions](https://github.com/pgvector/pgvector/issues/126#issuecomment-1589203644) for more information or simply use `sejaeger/postgres-vector` from docker hub.

This setup uses a couple of secrets to safely store passwords, tokens and private information. It's your responsibility to generate them and create the following secretes accordingly. 

* omnivore-image-proxy-secret
    * IMAGE_PROXY_SECRET
* omnivore-jwt-secret
    * JWT_SECRET
* omnivore-sso-jwt-secret
    * SSO_JWT_SECRET
* omnivore-pg-password
    * PG_PASSWORD
* postgres-admin-user-and-password
    * PGPASSWORD
    * POSTGRES_USER
* omnivore-content-fetch-verification-token
    * VERIFICATION_TOKEN


## Deployment

```console
helm repo add bjw-s https://bjw-s.github.io/helm-charts
helm repo update
```

In order to deploy the manifest for this example, issue the
following command:

```console
helm install omnivore bjw-s/app-template --values values.yaml
```

This will apply the rendered manifest(s) to your cluster.


## RSS Subscriptions

Currently, handling RSS subscriptions are not supported for self-hosted instances. However, you can use this simple tool for this: https://github.com/se-jaeger/omnivore-rss-handler-hack.

Adding the following `controller` and `persistence` information triggers the rss-handler hourly. 
```yaml
controllers:
  rss-handler-hack:
    type: cronjob
    cronjob:
      schedule: "*/60 * * * *"
      failedJobsHistoryLimit: 1
      successfulJobsHistoryLimit: 3
      concurrencyPolicy: Forbid
    containers:
      rss-handler-hack:
        image:
          repository: sejaeger/omnivore-rss-handler-hack
          tag: v0.2
          imagePullPolicy: IfNotPresent
        env:
          API_URL: "http://omnivore-omnivore-api:8080/api/graphql"
          CACHE_FILE: "/home/cache.json"
          FEEDS_FILE: "/home/feeds.json"
        envFrom:
          - secretRef:
              name: omnivore-api-token

persistence:
  rss-handler-hack:
    type: persistentVolumeClaim
    existingClaim: omnivore-pvc
    advancedMounts:
      rss-handler-hack: # controller name
        rss-handler-hack: # container name
          - path: /home
```

`FEEDS_FILE` is used to define the subscriptions:
```json
{
  "blog": "https://blog.example/feed",
  "another-blog": "https://another-blog.example/rss.xml",
}
```

`omnivore-api-token` secret contains a single key `API_TOKEN`, which can be generated using the Omnivore Web-UI.



## Currently not Implemented

* health checks
* resource limits