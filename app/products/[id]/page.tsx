"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarApp } from "@/components/sidebar-app";

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    image: string;
    slug: string;
  };
  images: string[];
  creationAt?: string;
  updatedAt?: string;
}

interface RelatedProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    image: string;
    slug: string;
  };
  images: string[];
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const productRes = await fetch(
          `https://api.escuelajs.co/api/v1/products/${productId}`
        );

        if (!productRes.ok) {
          throw new Error("Product not found");
        }

        const productData: Product = await productRes.json();
        setProduct(productData);

        // Fetch related products
        try {
          const relatedRes = await fetch(
            `https://api.escuelajs.co/api/v1/products/${productId}/related`
          );
          if (relatedRes.ok) {
            const relatedData: RelatedProduct[] = await relatedRes.json();
            setRelatedProducts(relatedData.slice(0, 4)); // Limit to 4 related products
          }
        } catch (error) {
          console.error("Error fetching related products:", error);
          // Don't fail the whole page if related products fail
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Product not found or failed to load");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleBack = () => {
    router.back();
  };

  const handleChatRedirect = () => {
    const query = product
      ? `I have questions about this product: ${product.title}`
      : "I need help with a product";
    router.push(`/chat?message=${encodeURIComponent(query)}`);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarApp />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="h-96 bg-gray-200 rounded"></div>
                    <div className="flex space-x-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-20 w-20 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !product) {
    return (
      <SidebarProvider>
        <SidebarApp />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Product Not Found
                </h1>
                <p className="text-gray-600 mb-6">
                  The product you&apos;re looking for doesn&apos;t exist or has
                  been removed.
                </p>
                <div className="space-x-4">
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={() => router.push("/products")}>
                    Browse Products
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarApp />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto p-6">
            {/* Back Button */}
            <Button onClick={handleBack} variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>

            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative h-96 bg-white rounded-lg overflow-hidden">
                  <Image
                    src={
                      product.images[selectedImageIndex] ||
                      "/placeholder-product.jpg"
                    }
                    alt={product.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-product.jpg";
                    }}
                  />
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index
                            ? "border-blue-500"
                            : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {product.category.name}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-3xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(4.5)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button size="lg" className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Need Help Choosing?
                      </h4>
                      <p className="text-blue-700 text-sm mb-3">
                        Our AI assistant can help you with questions about this
                        product or find similar items.
                      </p>
                      <Button
                        onClick={handleChatRedirect}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ask AI Assistant
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Related Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <Card
                      key={relatedProduct.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() =>
                        router.push(`/products/${relatedProduct.id}`)
                      }
                    >
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={
                            relatedProduct.images[0] ||
                            "/placeholder-product.jpg"
                          }
                          alt={relatedProduct.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {relatedProduct.title}
                        </CardTitle>
                        <Badge variant="secondary" className="w-fit">
                          {relatedProduct.category.name}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                          ${relatedProduct.price}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
