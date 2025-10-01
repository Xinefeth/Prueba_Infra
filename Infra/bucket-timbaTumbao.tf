
# Creacion del S3 bucket
resource "aws_s3_bucket" "website_bucket" {
  bucket = "wdc-my-website-bucket"  
## Nombre del bucket. Si se omite, Terraform asignará un nombre aleatorio y único.

  tags = {
    Name        = "My Website Bucket"
    Environment = "Dev"
  }

# Configuracion S3 bucket ownership controls
# aws_s3_bucket_ownership_controls Para buscar la documentación oficial de este recurso
# visita: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_ownership_controls

resource "aws_s3_bucket_ownership_controls" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
    #Ejemplo: Yo como propietario del bucket y otro usuario carga objetos dentro de él, con la regla BucketOwnerPreferred esos objetos pasan automáticamente a ser de mi propiedad como dueño del bucket
  }
}

# Configuracion S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = false
  # Evita que se apliquen ACLs públicas (Access Control Lists) a objetos o al bucket.
  block_public_policy     = false
  # Bloquea políticas de bucket que permitan acceso público.
  ignore_public_acls      = false
  # Ignora cualquier ACL pública existente en objetos.
  restrict_public_buckets = false
  # Restringe el acceso a buckets con políticas públicas.
}
# aws_s3_bucket_public_access_block Para buscar la documentación oficial de este recurso
# visita: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block

##########################################BORRARLO DESPUES (Pruebas))###############################################
# Configuracion S3 bucket ACL
resource "aws_s3_bucket_acl" "website_bucket" {
  # Garantiza que antes de aplicar la ACL, Terraform ya haya creado y configurado
  depends_on = [
    aws_s3_bucket_ownership_controls.website_bucket,
    # Define cómo se asigna la propiedad de los objetos
    aws_s3_bucket_public_access_block.website_bucket,
    # Reglas de acceso público (pueden bloquear ACLs).
  ]

  bucket = aws_s3_bucket.website_bucket.id
  acl    = "public-read"
  # Cualquiera en Internet podrá leer los objetos del bucket, pero solo tú (el owner) podrás escribir o borrar.
}

# aws_s3_bucket_public_access_block Para buscar la documentación oficial de este recurso
# visita: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_acl
