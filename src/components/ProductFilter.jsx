import React from 'react'
import styles from './ProductFilter.module.scss'

const ProductFilter = ({ brands = [], brandOptions = [], priceRange = 'all', onBrandsChange, onPriceChange, onReset }) => {
  const toggleBrand = (brand) => {
    const nextBrands = brands.includes(brand)
      ? brands.filter((item) => item !== brand)
      : [...brands, brand]
    onBrandsChange(nextBrands)
  }

  return (
    <div className={styles.filter}>
      <div className={styles.heading}>
        <h2>필터</h2>
        <button type='button' onClick={onReset}>초기화</button>
      </div>
      {brandOptions.length > 0 && (
        <fieldset>
          <legend>브랜드</legend>
          {brandOptions.map((brand) => (
          <label key={brand}>
            <input type='checkbox' checked={brands.includes(brand)} onChange={() => toggleBrand(brand)} />
            <span>{brand}</span>
          </label>
          ))}
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
