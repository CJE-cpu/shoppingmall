import React, { useState } from 'react'
import styles from './ProductFilter.module.scss'

const DEFAULT_BRAND_COUNT = 6

const ProductFilter = ({ brands = [], brandOptions = [], priceRange = 'all', onBrandsChange, onPriceChange, onReset }) => {
  const [isBrandExpanded, setIsBrandExpanded] = useState(false)

  const toggleBrand = (brand) => {
    const nextBrands = brands.includes(brand)
      ? brands.filter((item) => item !== brand)
      : [...brands, brand]
    onBrandsChange(nextBrands)
  }

  const visibleBrands = isBrandExpanded
    ? brandOptions
    : brandOptions.filter((brand, index) => (
        index < DEFAULT_BRAND_COUNT || brands.includes(brand)
      ))
  const hiddenBrandCount = brandOptions.length - DEFAULT_BRAND_COUNT

  return (
    <div className={styles.filter}>
      <div className={styles.heading}>
        <h2>필터</h2>
        <button type='button' onClick={onReset}>초기화</button>
      </div>
      {brandOptions.length > 0 && (
        <fieldset>
          <legend>브랜드</legend>
          {visibleBrands.map((brand) => (
            <label key={brand}>
              <input type='checkbox' checked={brands.includes(brand)} onChange={() => toggleBrand(brand)} />
              <span>{brand}</span>
            </label>
          ))}
          {hiddenBrandCount > 0 && (
            <button
              className={styles.moreButton}
              type='button'
              onClick={() => setIsBrandExpanded((current) => !current)}
              aria-expanded={isBrandExpanded}
            >
              {isBrandExpanded ? '브랜드 접기' : `브랜드 더보기 +${hiddenBrandCount}`}
            </button>
          )}
        </fieldset>
      )}
      <fieldset>
        <legend>가격대</legend>
        {[
          ['all', '전체 가격'],
          ['under100', '10만원 미만'],
          ['100to300', '10만원 ~ 30만원'],
          ['over300', '30만원 초과'],
        ].map(([value, label]) => (
          <label key={value}>
            <input type='radio' name='price' checked={priceRange === value} onChange={() => onPriceChange(value)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}

export default ProductFilter
