package com.carenode.common;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map result = cloudinary.uploader().upload(
                file.getBytes(),
                com.cloudinary.utils.ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"
                )
        );
        return (String) result.get("public_id");
    }

    public String uploadAudio(MultipartFile file, String folder) throws IOException {
        Map result = cloudinary.uploader().upload(
                file.getBytes(),
                com.cloudinary.utils.ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "video"
                )
        );
        return (String) result.get("public_id");
    }

    public String getUrl(String publicId, String resourceType) {
        return cloudinary.url().resourceType(resourceType).generate(publicId);
    }
}