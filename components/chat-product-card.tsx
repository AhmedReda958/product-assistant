"use client";

import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    image: string;
  };
  images: string[];
}

interface ChatProductCardProps {
  product: Product;
}

export function ChatProductCard({ product }: ChatProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "/placeholder-product.jpg",
      category: {
        id: product.category.id,
        name: product.category.name,
      },
    });
  };

  const description =
    product.description.length > 100
      ? product.description.substring(0, 100) + "..."
      : product.description;

  return (
    <Card className="w-full max-w-sm mx-auto my-4 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.images[0] || "/placeholder-product.jpg"}
          alt={product.title}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-product.jpg";
          }}
          unoptimized={true}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
        <Badge variant="secondary" className="w-fit">
          {product.category.name}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{description}</p>
        <p className="text-2xl font-bold text-green-600 mb-4">
          ${product.price}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            className="flex-1 flex items-center gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Link href={`/products/${product.id}`}>
              <ExternalLink className="h-4 w-4" />
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
