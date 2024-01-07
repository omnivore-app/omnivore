# Deployment using Helm

### Prerequisites

Make sure the Helm repository is installed as follows:

```console
helm repo add bjw-s https://bjw-s.github.io/helm-charts
helm repo update
```

### Deployment

In order to deploy the manifest for this example, issue the
following command:

```console
helm install omnivore bjw-s/app-template --namespace omnivore --values values.yaml
```

This will apply the rendered manifest(s) to your cluster.


## Notes

- using `sejaeger` docker images. You can build your own using: `build-and-push-images.sh`
- don't change the following because also hard coded: `PG_DB`, `PG_USER`
- requires postgres (+vector extension!) and elasticsearch
- make sure to change the values according to your setup, especially: postgres hostname, elasticsearch URL, omnivore URL
- information about possible setup see [https://github.com/bjw-s/helm-charts/blob/main/charts/library/common/values.yaml](https://github.com/bjw-s/helm-charts/blob/main/charts/library/common/values.yaml)


# TODOs

- health checks
- RSS feeds
- Docs