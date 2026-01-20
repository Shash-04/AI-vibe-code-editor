"use client";

import React, { useState, useEffect } from "react";
import { AvatarImage } from "@/components/ui/avatar";

interface ImageFetcherProps {
    src: string;
    alt: string;
}

export const ImageFetcher = ({ src, alt }: ImageFetcherProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch if it's an external URL and not a local placeholder
        if (!src || src.startsWith("/")) {
            setImageSrc(src);
            return;
        }

        const fetchImage = async () => {
            try {
                const response = await fetch(src, {
                    method: "GET",
                    // Add headers here if your server needs them
                    // headers: { "Authorization": "Bearer ..." }
                });

                if (!response.ok) throw new Error("Failed to fetch image");

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setImageSrc(objectUrl);
            } catch (error) {
                console.error("Error loading image:", error);
                setImageSrc("/placeholder.svg");
            }
        };

        fetchImage();

        // Cleanup the object URL to avoid memory leaks
        return () => {
            if (imageSrc && imageSrc.startsWith("blob:")) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    return (
        <AvatarImage
            src={imageSrc || "/placeholder.svg"}
            alt={alt}
            referrerPolicy="no-referrer"
        />
    );
};