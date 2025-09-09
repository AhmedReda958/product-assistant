"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  ShoppingCart,
  MessageCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarApp } from "@/components/sidebar-app";

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

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("https://api.escuelajs.co/api/v1/products"),
          fetch("https://api.escuelajs.co/api/v1/categories"),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        product.category.id.toString() === selectedCategory;

      const matchesPriceMin =
        !priceRange.min || product.price >= parseFloat(priceRange.min);
      const matchesPriceMax =
        !priceRange.max || product.price <= parseFloat(priceRange.max);

      return (
        matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax
      );
    });
  }, [products, searchTerm, selectedCategory, priceRange]);

  const handleChatRedirect = () => {
    router.push("/chat");
  };

  const handleAIHelp = (context?: string) => {
    // Navigate to chat with context about what the user needs help with
    const query = context
      ? `I need help with: ${context}`
      : "I need help finding the right product";
    router.push(`/chat?message=${encodeURIComponent(query)}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarApp />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
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
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Products
              </h1>
              <p className="text-gray-600">
                Discover amazing products from our store
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Price
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            min: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Price
                      </label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button onClick={clearFilters} variant="outline" size="sm">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count with AI Help */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              {filteredProducts.length > 0 && (
                <Button
                  onClick={() =>
                    handleAIHelp("I need help choosing between these products")
                  }
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 "
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Need help choosing?
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
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
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {product.title}
                      </CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {product.category.name}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ${product.price}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button className="w-full flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              /* No Results State */
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any products matching your search
                    criteria.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                    <div className="text-sm text-gray-500">or</div>
                    <Button
                      onClick={handleChatRedirect}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Can&apos;t find what you&apos;re searching for?
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
