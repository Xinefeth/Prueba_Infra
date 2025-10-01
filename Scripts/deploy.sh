#!/bin/bash

# Desactiva el pager de Terraform (para que no bloquee la salida)
export PAGER=''

# 1. Aplicar infraestructura
pushd infra
  terraform init
  terraform apply --auto-approve

  BUCKET_NAME=$(terraform output -raw s3_bucket_name)
  CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
  CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME=$(terraform output -raw cloudfront_distribution_domain_name)
popd

# 2. Construir la aplicación (frontend)
npm run build

# 3. Copiar archivos generados al bucket
aws s3 cp dist/ "s3://${BUCKET_NAME}/" --recursive

# 4. Invalidar caché en CloudFront
aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"

# 5. Mostrar la URL del sitio
echo "https://${CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}"
