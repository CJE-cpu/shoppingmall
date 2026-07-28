import { useEffect, useState } from 'react'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetch('/data/categories.json')
      .then((response) => {
        if (!response.ok) throw new Error('카테고리를 불러오지 못했습니다.')
        return response.json()
      })
      .then((data) => {
        if (isMounted) setCategories(data)
      })
      .catch(() => {
        if (isMounted) setCategories([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { categories, isLoading }
}
