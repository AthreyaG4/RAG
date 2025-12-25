import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime
import uuid
from typing import List
from fastapi import UploadFile

async def upload_files_to_s3(files: List[UploadFile]):
    S3_BUCKET = os.getenv("S3_BUCKET_NAME")
    AWS_REGION = os.getenv("AWS_REGION")

    s3_client = boto3.client(
        's3',
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

    allowed_extensions = {".pdf", ".txt", ".md", ".doc", ".docx"}

    results = []
    total_size = 0

    for file in files:
        file_ext = os.path.splitext(file.filename)[1].lower() # type: ignore
        if file_ext not in allowed_extensions:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"File type {file_ext} not allowed"
            })
            continue
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        original_name = os.path.splitext(file.filename)[0] #type: ignore
        s3_key = f"uploads/{timestamp}_{unique_id}_{original_name}{file_ext}"

        try:
            file_content = await file.read()
            file_size = len(file_content)
            
            # Upload to S3
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type or "application/octet-stream",
                Metadata={
                    'original_filename': file.filename,
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            file_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "s3_key": s3_key,
                "file_url": file_url,
                "size": file_size
            })
            
            total_size += file_size
            
        except ClientError as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"S3 upload failed: {str(e)}"
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"Upload failed: {str(e)}"
            })

    successful = sum(1 for r in results if r["status"] == "success")
    failed = len(results) - successful

    return {
        "results": results,
        "total_size": total_size,
        "successful_count": successful,
        "failed_count": len(results) - successful
    }