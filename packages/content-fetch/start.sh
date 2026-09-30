#!/bin/bash
cat hosts >> /etc/hosts
/app/goproxy &
yarn workspace @omnivore/content-fetch start
