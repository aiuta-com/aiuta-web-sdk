import React, { useState } from "react";

// components
import { TryOnButton } from "@/components/feature";

export default function UploadImages() {
  const [productId, setProductId] = useState("");
  const [productHandle, setProductHandle] = useState("");
  const [uploadImageUrl, setUploadImageUrl] = useState("");

  const uploadAllImages = async (images: Array<string>) => {
    if (!images.length) {
      return [];
    }

    const uploadResponse = [];
    for (const url of images) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append("image_data", blob, "image.jpg");

        const uploadedData = await fetch(
          `https://api.aiuta.com/digital-try-on/v1/uploaded_images`,
          {
            method: "POST",
            headers: { "x-api-key": "3iUr4Hc7TsAfB8DjM1XH98rIWX2ohu8r" },
            body: formData,
          }
        );

        const data = await uploadedData.json();

        if (data && "id" in data && "url" in data) {
          uploadResponse.push(data);
        } else {
          console.error("Upload image for train product Error: ", data);
        }
      } catch (error) {
        console.error("Error uploading an image:", error);
      }
    }

    return uploadResponse;
  };

  const handleGenerateImageId = async () => {
    const randomToken = Math.floor(Math.random() * 100000);

    const images = await uploadAllImages(uploadImageUrl.split(","));
    const imageIds = images.map((image) => image.id);

    const sku = {
      sku_id: `aiuta-demo${randomToken}`,
      product_id: `gid://shopify/Product/${productId}`,
      title: "test title",
      description: "test description",
      gender: "female",
      age_group: "adult",
      category_google_name: "Apparel & Accessories > Clothing > Dresses",
      color: "",
      images: imageIds,
      store_url: `https://aiuta-demo-store/products/${productHandle}`,
    };

    const response = await fetch(
      `https://api.aiuta.com/digital-try-on/v1/sku_items/aiuta-demo-store`,
      {
        method: "POST",
        headers: {
          "x-api-key": "3iUr4Hc7TsAfB8DjM1XH98rIWX2ohu8r",
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(sku),
      }
    );

    await response.json();
  };
  return (
    <>
      <input
        type="text"
        placeholder="Upload image url"
        onChange={(e) => setUploadImageUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10, height: 30 }}
      />
      <input
        type="text"
        placeholder="Product ID"
        onChange={(e) => setProductId(e.target.value)}
        style={{ width: "100%", marginBottom: 10, height: 30 }}
      />
      <input
        type="text"
        placeholder="Product Handle"
        onChange={(e) => setProductHandle(e.target.value)}
        style={{ width: "100%", marginBottom: 10, height: 30 }}
      />
      <TryOnButton onClick={handleGenerateImageId}>Train SKU</TryOnButton>
    </>
  );
}
