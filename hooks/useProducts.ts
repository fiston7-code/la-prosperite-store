// hooks/use-products.ts
'use client'

import { useEffect, useState, useTransition } from 'react'
import { productService, ProductFilters } from '@/services/products'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isPending, startTransition] = useTransition()
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: ProductFilters = {
    category: searchParams.get('category') || initialFilters?.category,
    search: searchParams.get('q') || undefined,
    sortBy: (searchParams.get('sort') as ProductFilters['sortBy']) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        const { products, total } = await productService.getAll(filters)
        setProducts(products)
        setTotal(total)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value))
        } else {
          params.delete(key)
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return {
    products,
    total,
    isLoading: isLoading || isPending,
    error,
    filters,
    updateFilters,
  }
}