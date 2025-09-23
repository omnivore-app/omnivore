#!/bin/bash

set -e

echo "Starting S3/MinIO setup..."

# Wait for MinIO to be ready if using MinIO
if [ "$AWS_ACCESS_KEY_ID" = "minio" ]; then
    echo "Detected MinIO configuration"
    echo "Waiting for MinIO to be ready..."
    sleep 5

    # Setup MinIO with bucket creation
    until (/usr/bin/mc alias set myminio http://minio:9000 minio miniominio) do
        echo '...waiting for MinIO...'
        sleep 1
    done

    echo "Creating MinIO bucket: ${GCS_UPLOAD_BUCKET:-omnivore}"
    /usr/bin/mc mb myminio/${GCS_UPLOAD_BUCKET:-omnivore} || true
    /usr/bin/mc anonymous set public myminio/${GCS_UPLOAD_BUCKET:-omnivore}
    echo "MinIO setup complete"

else
    echo "Detected AWS S3 configuration"

    # Install AWS CLI if not present
    if ! command -v aws &> /dev/null; then
        echo "Installing AWS CLI..."
        apk add --no-cache aws-cli
    fi

    BUCKET_NAME="${GCS_UPLOAD_BUCKET:-omnivore}"
    CORS_ORIGIN="${CLIENT_URL:-https://localhost:3000}"
    AWS_REGION="${AWS_REGION:-us-east-1}"

    echo "Configuring CORS for S3 bucket: $BUCKET_NAME"
    echo "Allowed origin: $CORS_ORIGIN"

    # Create CORS configuration JSON
    cat > /tmp/cors.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["$CORS_ORIGIN"],
            "ExposeHeaders": [
                "ETag",
                "x-amz-server-side-encryption",
                "x-amz-request-id",
                "x-amz-id-2"
            ],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

    # Apply CORS configuration
    echo "Applying CORS configuration..."
    aws s3api put-bucket-cors \
        --bucket "$BUCKET_NAME" \
        --region "$AWS_REGION" \
        --cors-configuration file:///tmp/cors.json

    echo "S3 CORS configuration complete for bucket: $BUCKET_NAME"

    # Verify CORS configuration
    echo "Verifying CORS configuration..."
    aws s3api get-bucket-cors --bucket "$BUCKET_NAME" --region "$AWS_REGION" || echo "CORS verification failed (this may be normal if bucket doesn't exist yet)"
fi

echo "S3 setup completed successfully"